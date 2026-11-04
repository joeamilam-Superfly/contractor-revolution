exports.handler = async function handler(event) {
  const headers = {
    'content-type': 'application/json',
    'cache-control': 'no-store',
  };

  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ stripe: false }),
    };
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed.' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Check the form and try again.' }) };
  }

  const seats = Number(body.seats);
  const company = String(body.company || '').trim();
  const contact = String(body.contact || '').trim();
  const email = String(body.email || '').trim();
  const phone = String(body.phone || '').replace(/\D/g, '');

  if (!Number.isInteger(seats) || seats < 1 || seats > 200) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Enter a whole number of users from 1 to 200.' }) };
  }
  if (company.length < 2 || contact.length < 2) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Enter the company name and your name.' }) };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Enter a valid email address.' }) };
  }
  if (phone.length < 7 || phone.length > 15) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Enter a phone number.' }) };
  }
  if (body.billing !== 'monthly' && body.billing !== 'annual') {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Pick monthly or annual billing.' }) };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ mode: 'form' }),
  };
};
