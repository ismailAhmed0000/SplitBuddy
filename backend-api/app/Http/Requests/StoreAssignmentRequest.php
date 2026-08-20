<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreAssignmentRequest extends FormRequest
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
            'group_member_id' => ['required', 'integer', 'exists:group_members,id'],
            'share_type' => ['required', 'string', 'in:equal,percentage,exact_amount'],
            'share_value' => ['required_unless:share_type,equal', 'nullable', 'numeric', 'min:0'],
        ];
    }
}
