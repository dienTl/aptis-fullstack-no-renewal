export function apiMessage(error, fallback = 'Co loi xay ra.') {
  return error?.response?.data?.message || error?.message || fallback;
}

export function apiFields(error) {
  return error?.response?.data?.data?.fields || {};
}
