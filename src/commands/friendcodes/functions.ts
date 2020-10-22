export function verifyFriendCode(code: string): boolean {
  const regex = /[SW-]?[0-9]{4}-[0-9]{4}-[0-9]{4}/;

  return code.match(regex) ? true : false;
}
