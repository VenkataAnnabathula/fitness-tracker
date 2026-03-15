"use client";

import { ParsedMealItem } from "@/lib/api";

const UNITS = ["count", "cup", "gram", "ml", "piece", "serving", "bowl", "plate", "slice", "tbsp", "tsp"];

interface Props {
  items: ParsedMealItem[];
  onChange: (index: number, field: keyof ParsedMealItem, value: string) => void;
  onRemove: (index: number) => void;
}

/**
 * Editable table shown after the LLM parses a meal.
 * Users can adjust food name, quantity, and unit before confirming.
 */
export default function ParsedMealTable({ items, onChange, onRemove }: Props) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="parsed-table">
        <thead>
          <tr>
            <th style={{ width: "44%" }}>Food</th>
            <th style={{ width: "18%" }}>Qty</th>
            <th style={{ width: "28%" }}>Unit</th>
            <th style={{ width: "10%" }}></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i}>
              <td>
                <input
                  value={item.food_name}
                  onChange={(e) => onChange(i, "food_name", e.target.value)}
                  aria-label="Food name"
                />
              </td>
              <td>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={item.quantity}
                  onChange={(e) => onChange(i, "quantity", e.target.value)}
                  aria-label="Quantity"
                />
              </td>
              <td>
                <select
                  value={item.unit}
                  onChange={(e) => onChange(i, "unit", e.target.value)}
                  aria-label="Unit"
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </td>
              <td>
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => onRemove(i)}
                  aria-label={`Remove ${item.food_name}`}
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
