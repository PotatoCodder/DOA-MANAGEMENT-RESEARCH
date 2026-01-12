import bcrypt from "bcrypt";

export async function hashedPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  plain: string,
  hashed: string
  ) {
  return bcrypt.compare(plain, hashed);
}
