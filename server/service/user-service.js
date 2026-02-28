const UserModel = require('../models/user-model');
const bcrypt = require('bcrypt');
const mailService = require('./mail-service');
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exceptions/api-error');

class UserService {
async registration(email, password) {
    const { v4: uuidV4 } = await import('uuid');
    const candidate = await UserModel.findOne({email})
    if (candidate) {
        throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует`)
    }
    const hashPassword = await bcrypt.hash(password, 3);
    const activationLink = uuidV4();
    const user = await UserModel.create({email, password: hashPassword, activationLink});
    
    // Email отправка отключена (настройте SMTP в .env для включения)
    // try {
    //     await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);
    // } catch (e) {
    //     console.log('Ошибка отправки email:', e.message);
    // }
    
    const userDto = new UserDto(user);
    const tokens = tokenService.generateToken({...userDto});
    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    
    console.log({ ...tokens, user: userDto }  );
    

    return { ...tokens, user: userDto }  
}
async activate(activationLink) {
const user = await UserModel.findOne({activationLink})
if (!user) {
    throw new ApiError.BadRequest ('Некорректная ссылка активации')
}
user.isActivated = true;
await user.save();
}

async login(email, password) {
    const user = await UserModel.findOne({email})
    if(!user) {
        throw ApiError.BadRequest('Пользователь не был найден')
    }
    const isPassEquals = await bcrypt.compare(password, user.password)
if (!isPassEquals) {
    throw ApiError.BadRequest('Неверный пароль');
}
const userDto = new UserDto(user);
const tokens = tokenService.generateToken({...userDto});

await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return { ...tokens, user: userDto } 
}

async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
}

async refresh(refreshToken) {
    if(!refreshToken) {
        throw ApiError.UnauthorizedError();
    }
    const userData = tokenService.validateRefreshToken(refreshToken);
const tokenFromDb = await tokenService.findToken(refreshToken);
if(!userData || !tokenFromDb) {
    throw ApiError.UnauthorizedError();
}

const user = await UserModel.findById(userData.id);
const userDto = new UserDto(user);
const tokens = tokenService.generateToken({...userDto});

await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return { ...tokens, user: userDto } 

}

async getAllUsers() {
    const users = await UserModel.find();    
    return users;
}
}

module.exports = new UserService();
