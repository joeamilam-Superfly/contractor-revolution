/** Published Isom Technologies contact details. Do not invent replacements. */
export const CONTACT = {
  product: "Contractor Revolution",
  vendor: "Isom Technologies",
  vendorUrl: "https://isomtechnologies.com",
  phoneDisplay: "864-437-1827",
  phoneTel: "+18644371827",
  email: "info@isomtechnologies.com",
  supportEmail: "support@isomtechnologies.com",
  street: "7205 US 76",
  locality: "Pendleton",
  region: "SC",
  postalCode: "29670",
};

export const ADDRESS_LINE = `${CONTACT.street}, ${CONTACT.locality}, ${CONTACT.region} ${CONTACT.postalCode}`;

export const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS_LINE)}`;
