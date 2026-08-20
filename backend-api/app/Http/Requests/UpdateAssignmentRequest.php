<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateAssignmentRequest extends FormRequest
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
            'group_member_id' => ['sometimes', 'required', 'integer', 'exists:group_members,id'],
            'share_type' => ['sometimes', 'required', 'string', 'in:equal,percentage,exact_amount'],
            'share_value' => ['sometimes', 'nullable', 'numeric', 'min:0'],
        ];
    }
}
