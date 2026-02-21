export class Constants {
    static readonly jwtSecret = process.env.JWT_SECRET || 'secretKey';
}