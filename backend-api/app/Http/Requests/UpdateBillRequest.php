<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateBillRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'image_url' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'merchant_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'bill_date' => ['sometimes', 'nullable', 'date'],
            'subtotal' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'tax_amount' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'tax_label' => ['sometimes', 'nullable', 'string', 'max:255'],
            'discount_amount' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'discount_type' => ['sometimes', 'nullable', 'string', 'in:flat,percentage'],
            'service_charge' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'tip_amount' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'total' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'tax_split_method' => ['sometimes', 'nullable', 'string', 'in:proportional,even'],
            'discount_split_method' => ['sometimes', 'nullable', 'string', 'in:proportional,even'],
            'status' => ['sometimes', 'required', 'string', 'in:processing,parsed,confirmed,failed'],
        ];
    }
}
