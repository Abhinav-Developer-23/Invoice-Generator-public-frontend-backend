import { Role } from "./role";
export type User = {
    username: string;
    email: string;
    password: string;
    role :'ADMIN'|'USER'
}