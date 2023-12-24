import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { logger } from "../config/logger";
import { jwtUser } from "../types/jwtUserModel";
import jwt from 'jsonwebtoken';
const prisma = new PrismaClient();

export const signupUser = async (
  username: string,
  email: string,
  password: string,
  role: "USER" | "ADMIN"
) => {
  try {
    // Create a new user with the provided information
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        username: username,
        email: email,
        password: hashedPassword,
        roles: {
          create: [
            {
              name: role,
            },
          ],
        },
      },
    });

    return newUser;
  } catch (error) {
    console.error("Error creating user:", error);
  } finally {
    await prisma.$disconnect(); // Disconnect from the Prisma client
  }
};

export const generateJwt = async (email: string, password: string) => {

  try
  {
  const foundUser = await prisma.user.findUnique({
    where: {
      email: email,
    },
    include: {
      roles: true
  }});
  if (!foundUser) {
    return undefined;
  } else {
    const storedHashedPassword = foundUser.password;

    const isPasswordValid = await bcrypt.compare(
      password,
      storedHashedPassword
    );
    logger.info("is password ", isPasswordValid);
    if (isPasswordValid) {
      const user: jwtUser = {
        username: foundUser.username,
        email: foundUser.email,
        role: foundUser.roles[0].name as 'USER'||'ADMIN',//TYPECASt
      };
      const secretKey=process.env.JWT_KEY!;
      const options = { expiresIn: '3d' };
       const jwtKey=jwt.sign(user,secretKey,options);
       return jwtKey

    } else {
      logger.info("user not found");
      throw new Error("User not found")
    }
  }
}
catch(e)
{
  logger.error("error while generating jwt ",e)
}
};
