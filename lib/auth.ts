

export function xDate() {
  // 使用UTC时间，精确到秒，使用遵循ISO 8601标准的格式：YYYYMMDD'T'HHMMSS'Z'
  return new Date().toISOString().replace('T', ' ').replace('Z', '')
}

// export function authorization() {
//     // HMAC-SHA256 Credential={AccessKeyId}/{ShortDate}/{Region}/{Service}/request, SignedHeaders={SignedHeaders}, Signature={Signature}
//     const accessKeyId = 'AKIDEXAMPLE'
//     const secretAccessKey = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
//     const region = 'us-east-1'
//     const service = 's3'
//     const shortDate = xDate().substring(0, 8)
//     const stringToSign = `HMAC-SHA256\n${shortDate}\n${region}\n${service}\nrequest`
//     const signature = crypto.createHmac('sha256', secretAccessKey).update(stringToSign).digest('hex')

// }