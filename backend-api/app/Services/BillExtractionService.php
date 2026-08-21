<?php

namespace App\Services;

use Anthropic\Client;
use RuntimeException;

class BillExtractionService
{
    private Client $client;

    public function __construct()
    {
        $this->client = new Client(apiKey: config('services.anthropic.api_key'));
    }

    /**
     * Read a receipt image and return structured bill data.
     *
     * @return array{
     *     merchant_name: ?string,
     *     bill_date: ?string,
     *     items: array<int, array{name: string, quantity: float, unit_price: float, total_price: float}>,
     *     subtotal: ?float,
     *     tax_amount: ?float,
     *     tax_label: ?string,
     *     discount_amount: ?float,
     *     discount_type: ?string,
     *     service_charge: ?float,
     *     tip_amount: ?float,
     *     total: ?float,
     * }
     */
    public function extract(string $absoluteImagePath, string $mediaType): array
    {
        $imageData = base64_encode(file_get_contents($absoluteImagePath));

        $message = $this->client->messages->create(
            model: config('services.anthropic.model'),
            maxTokens: 4096,
            messages: [
                [
                    'role' => 'user',
                    'content' => [
                        [
                            'type' => 'image',
                            'source' => [
                                'type' => 'base64',
                                'media_type' => $mediaType,
                                'data' => $imageData,
                            ],
                        ],
                        [
                            'type' => 'text',
                            'text' => $this->prompt(),
                        ],
                    ],
                ],
            ],
            outputConfig: ['format' => ['type' => 'json_schema', 'schema' => $this->schema()]],
        );

        foreach ($message->content as $block) {
            if ($block->type === 'text') {
                return json_decode($block->text, true, flags: JSON_THROW_ON_ERROR);
            }
        }

        throw new RuntimeException('Claude did not return a text response.');
    }

    private function prompt(): string
    {
        return <<<'PROMPT'
            You are reading a photo of a restaurant or store receipt. Extract every
            line item and every charge exactly as printed, then return the data as
            JSON matching the provided schema.

            Rules:
            - List every purchased item as a separate entry in "items", even if the
              receipt groups repeated items on one line (expand "3x Coffee" into a
              single item with quantity 3).
            - "unit_price" is the price of one unit; "total_price" is the printed
              line total for that item (use the printed total when given, since it
              may include modifiers not reflected in the unit price).
            - "subtotal" is the pre-tax, pre-tip, pre-discount sum printed on the
              receipt. If it isn't printed, compute it as the sum of item totals.
            - "tax_amount" and "tax_label" come from the printed tax line (e.g. "Sales
              Tax", "VAT"). Leave both null if there is no tax line.
            - "discount_amount" is the printed discount value. Set "discount_type" to
              "percentage" if the receipt shows a percentage-based discount (in which
              case discount_amount is the percentage number, e.g. 10 for 10%), or
              "flat" if it's a printed dollar amount. Leave both null if there is no
              discount.
            - "service_charge" is a mandatory service/gratuity charge printed on the
              receipt, separate from an optional tip line.
            - "tip_amount" is only the tip if one is already printed/filled in on the
              receipt. Leave it null if there's a blank tip line for the customer to
              fill in by hand.
            - "total" is the final printed total.
            - Use null for any field that isn't present on the receipt rather than
              guessing or defaulting to 0.
            - All money fields are plain numbers, no currency symbols.
            PROMPT;
    }

    private function schema(): array
    {
        return [
            'type' => 'object',
            'properties' => [
                'merchant_name' => ['type' => ['string', 'null']],
                'bill_date' => [
                    'type' => ['string', 'null'],
                    'description' => 'ISO 8601 date (YYYY-MM-DD)',
                ],
                'items' => [
                    'type' => 'array',
                    'items' => [
                        'type' => 'object',
                        'properties' => [
                            'name' => ['type' => 'string'],
                            'quantity' => ['type' => 'number'],
                            'unit_price' => ['type' => 'number'],
                            'total_price' => ['type' => 'number'],
                        ],
                        'required' => ['name', 'quantity', 'unit_price', 'total_price'],
                        'additionalProperties' => false,
                    ],
                ],
                'subtotal' => ['type' => ['number', 'null']],
                'tax_amount' => ['type' => ['number', 'null']],
                'tax_label' => ['type' => ['string', 'null']],
                'discount_amount' => ['type' => ['number', 'null']],
                'discount_type' => [
                    'anyOf' => [
                        ['type' => 'string', 'enum' => ['flat', 'percentage']],
                        ['type' => 'null'],
                    ],
                ],
                'service_charge' => ['type' => ['number', 'null']],
                'tip_amount' => ['type' => ['number', 'null']],
                'total' => ['type' => ['number', 'null']],
            ],
            'required' => [
                'merchant_name', 'bill_date', 'items', 'subtotal', 'tax_amount',
                'tax_label', 'discount_amount', 'discount_type', 'service_charge',
                'tip_amount', 'total',
            ],
            'additionalProperties' => false,
        ];
    }
}
