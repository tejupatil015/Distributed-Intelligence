import type { ChangeEvent, FormEvent } from "react";

export type OrderProduct = {
  id: string;
  name: string;
  price: number;
};

export type OrderFormValues = {
  customer_name: string;
  customer_email: string;
  phone: string;
  address: string;
};

type OrderFormProps = {
  form: OrderFormValues;
  products: OrderProduct[];
  selectedProductId: string;
  quantity: number;
  estimatedTotal: number;
  loading: boolean;
  error: string;
  result: string;
  formatMoney: (value: number) => string;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onProductChange: (productId: string) => void;
  onQuantityChange: (quantity: number) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function OrderForm({
  form,
  products,
  selectedProductId,
  quantity,
  estimatedTotal,
  loading,
  error,
  result,
  formatMoney,
  onChange,
  onProductChange,
  onQuantityChange,
  onSubmit,
}: OrderFormProps) {
  return (
    <form className="tracking-form" onSubmit={onSubmit}>
      <section className="tracking-form-step">
        <div className="tracking-step-heading">
          <span>01</span>
          <div>
            <h3>Customer details</h3>
            <p>Who should we contact about this order?</p>
          </div>
        </div>
        <div className="tracking-field-grid">
          <div className="tracking-field">
            <label htmlFor="customer_name">Customer Name *</label>
            <input
              id="customer_name"
              name="customer_name"
              type="text"
              placeholder="Enter customer name"
              value={form.customer_name}
              onChange={onChange}
              required
            />
          </div>
          <div className="tracking-field">
            <label htmlFor="customer_email">Email</label>
            <input
              id="customer_email"
              name="customer_email"
              type="email"
              placeholder="Enter email address"
              value={form.customer_email}
              onChange={onChange}
            />
          </div>
        </div>
      </section>

      <section className="tracking-form-step">
        <div className="tracking-step-heading">
          <span>02</span>
          <div>
            <h3>Delivery details</h3>
            <p>Where should we send your order?</p>
          </div>
        </div>
        <div className="tracking-field-grid">
          <div className="tracking-field">
            <label htmlFor="phone">Phone Number *</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Enter phone number"
              value={form.phone}
              onChange={onChange}
              required
            />
          </div>
          <div className="tracking-field">
            <label htmlFor="address">Delivery Address *</label>
            <textarea
              id="address"
              name="address"
              placeholder="Enter complete delivery address"
              value={form.address}
              onChange={onChange}
              rows={3}
              required
            />
          </div>
        </div>
      </section>

      <section className="tracking-form-step tracking-product-step">
        <div className="tracking-step-heading">
          <span>03</span>
          <div>
            <h3>Review your order</h3>
            <p>Choose a product and confirm the quantity.</p>
          </div>
        </div>
        <div className="tracking-field-grid">
          <div className="tracking-field">
            <label htmlFor="product">Select Product *</label>
            <select
              id="product"
              value={selectedProductId}
              onChange={(event) => onProductChange(event.target.value)}
            >
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} — {formatMoney(product.price)}
                </option>
              ))}
            </select>
          </div>
          <div className="tracking-field">
            <label htmlFor="quantity">Quantity *</label>
            <input
              id="quantity"
              type="number"
              min={1}
              step={1}
              value={quantity}
              onChange={(event) =>
                onQuantityChange(Math.max(1, Number(event.target.value) || 1))
              }
              required
            />
          </div>
        </div>
        <div className="tracking-order-total">
          <span>Estimated Total</span>
          <strong>{formatMoney(estimatedTotal)}</strong>
        </div>
      </section>

      <div className="tracking-form-actions">
        {error && (
          <p className="tracking-message tracking-message-error" role="alert">
            {error}
          </p>
        )}

        {result && (
          <p
            className="tracking-message tracking-message-success"
            role="status"
          >
            {result}
          </p>
        )}

        <button type="submit" disabled={loading} className="tracking-submit">
          {loading ? "Submitting Order..." : "Place Order"}
        </button>
      </div>
    </form>
  );
}
