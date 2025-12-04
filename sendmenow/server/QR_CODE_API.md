# QR Code Generator API

This API allows you to generate QR codes for any text or URL.

## Installation

Make sure the `qrcode` package is installed:

```bash
cd server
npm install
```

## Endpoints

### GET `/api/qrcode`

Generate a QR code using query parameters.

**Query Parameters:**
- `data` (required): The text or URL to encode in the QR code
- `format` (optional): Output format - `png` (default), `svg`, or `dataurl`
- `size` (optional): Size in pixels (default: 200, range: 50-2000)
- `margin` (optional): Margin size (default: 4)
- `errorCorrectionLevel` (optional): Error correction level - `L`, `M` (default), `Q`, or `H`

**Example Requests:**

1. **Basic PNG QR Code:**
   ```
   GET http://localhost:5000/api/qrcode?data=https://example.com
   ```

2. **Custom Size:**
   ```
   GET http://localhost:5000/api/qrcode?data=Hello World&size=300
   ```

3. **SVG Format:**
   ```
   GET http://localhost:5000/api/qrcode?data=Hello World&format=svg
   ```

4. **Data URL (JSON response):**
   ```
   GET http://localhost:5000/api/qrcode?data=Hello World&format=dataurl
   ```

5. **High Error Correction:**
   ```
   GET http://localhost:5000/api/qrcode?data=Important Data&errorCorrectionLevel=H&size=400
   ```

### POST `/api/qrcode`

Generate a QR code using JSON body (supports color customization).

**Request Body:**
```json
{
  "data": "https://example.com",
  "format": "png",
  "size": 200,
  "margin": 4,
  "errorCorrectionLevel": "M",
  "darkColor": "#000000",
  "lightColor": "#FFFFFF"
}
```

**Example Requests:**

1. **Basic QR Code:**
   ```bash
   curl -X POST http://localhost:5000/api/qrcode \
     -H "Content-Type: application/json" \
     -d '{"data": "https://example.com"}'
   ```

2. **Custom Colors:**
   ```bash
   curl -X POST http://localhost:5000/api/qrcode \
     -H "Content-Type: application/json" \
     -d '{
       "data": "Hello World",
       "size": 300,
       "darkColor": "#FF0000",
       "lightColor": "#FFFF00"
     }'
   ```

3. **Data URL Response:**
   ```bash
   curl -X POST http://localhost:5000/api/qrcode \
     -H "Content-Type: application/json" \
     -d '{
       "data": "https://example.com",
       "format": "dataurl"
     }'
   ```

## Response Formats

### PNG Image (default)
Returns a PNG image file that can be displayed directly or saved.

**Content-Type:** `image/png`

### SVG Image
Returns an SVG image that can be scaled without quality loss.

**Content-Type:** `image/svg+xml`

### Data URL (JSON)
Returns a JSON response with a base64-encoded data URL.

**Response:**
```json
{
  "success": true,
  "dataUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "format": "png",
  "size": 200,
  "data": "https://example.com"
}
```

## Error Correction Levels

- **L (Low)**: ~7% error correction - Smallest QR code
- **M (Medium)**: ~15% error correction - Default, balanced
- **Q (Quartile)**: ~25% error correction - Better for damaged codes
- **H (High)**: ~30% error correction - Best for damaged codes, largest size

## Use Cases

1. **URLs**: Generate QR codes for website links
2. **Contact Information**: vCard format for business cards
3. **WiFi Credentials**: Generate WiFi QR codes
4. **Text Messages**: Encode any text data
5. **App Downloads**: Link to app stores
6. **Payment Information**: Payment QR codes

## Frontend Integration Example

### Using in React:

```javascript
// Display QR code as image
<img src={`http://localhost:5000/api/qrcode?data=${encodeURIComponent('https://example.com')}&size=200`} alt="QR Code" />

// Get data URL for embedding
const generateQRCode = async (data) => {
  const response = await fetch(`http://localhost:5000/api/qrcode?data=${encodeURIComponent(data)}&format=dataurl`);
  const result = await response.json();
  return result.dataUrl;
};
```

### Using in HTML:

```html
<!-- Direct image display -->
<img src="http://localhost:5000/api/qrcode?data=https://example.com&size=200" alt="QR Code" />

<!-- Download link -->
<a href="http://localhost:5000/api/qrcode?data=https://example.com&size=300" download="qrcode.png">
  Download QR Code
</a>
```

## Error Responses

All errors return JSON with the following format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

**Common Errors:**
- `400`: Missing or invalid parameters
- `500`: Server error during QR code generation

