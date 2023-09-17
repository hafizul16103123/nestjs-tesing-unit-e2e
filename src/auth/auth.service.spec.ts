import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { AuthService } from './auth.service';
import { User } from './schemas/user.schema';

describe('AuthService', () => {
  let authService: AuthService;
  let userModel: Model<User>;
  let jwtService: JwtService;
  //mockBookModelService
  const mockBookModel = {
    create: jest.fn(),
    findOne: jest.fn(),
  };
  const bookModelToken = getModelToken(User.name)
  const BookModelService = {
    provide: bookModelToken,
    useValue: mockBookModel,
  }

  const mockUser = {
    _id: '61c0ccf11d7bf83d153d7c06',
    name: 'Ghulam',
    email: 'hafiz@gmail.com',
  };

  let token = 'jwtToken';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        BookModelService
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userModel = module.get<Model<User>>(getModelToken(User.name));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signUp', () => {

    it('should register new user', async () => {
      const newUser = {
        name: 'hafiz',
        email: 'hafiz@gmail.com',
        password: 'hashedPassword',
      }
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword')
      jest.spyOn(userModel, 'create').mockImplementationOnce(() => Promise.resolve(mockUser))
      jest.spyOn(jwtService, 'sign').mockReturnValue('jwtToken')

      const res = await authService.signUp(newUser)
      expect(res).toEqual({ token })
      expect(userModel.create).toHaveBeenCalledWith(newUser)
      expect(bcrypt.hash).toHaveBeenCalledWith(newUser.password, 10)
      expect(jwtService.sign).toHaveBeenCalledWith({ id: mockUser._id })
    })
    it('should throw duplicate error if email already exists', async () => {
      const newUser = {
        name: 'hafiz',
        email: 'hafiz@gmail.com',
        password: 'hashedPassword',
      }
      jest.spyOn(userModel, 'create').mockImplementationOnce(() => Promise.reject({ code: 11000 }))

      const res = authService.signUp(newUser)
      expect(res).rejects.toThrowError()

    })

  })

  describe('login', () => {
    it('should login user', async () => {
      const loginDto = {
        email: 'hafiz@gmail.com',
        password: "password"
      }
      const mockFindUser = {
        _id: '61c0ccf11d7bf83d153d7c06',
        name: 'Ghulam',
        email: 'hafiz@gmail.com',
        password:'hashedPassword'
      };
      jest.spyOn(userModel, 'findOne').mockResolvedValue(mockFindUser)
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true)
      jest.spyOn(jwtService, 'sign').mockReturnValue('jwtToken')

      const res = await authService.login(loginDto)
      expect(res).toEqual({ token })
      expect(userModel.findOne).toHaveBeenCalledWith({ email: mockUser.email })
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockFindUser.password)
      expect(jwtService.sign).toHaveBeenCalledWith({id:mockFindUser._id})

    })

    it('should throw unauthorized exception when user not found', async () => {
      const loginDto = {
        email: 'hafiz@gmail.com',
        password: "password"
      }
      jest.spyOn(userModel, 'findOne').mockResolvedValue(null)


      const res = authService.login(loginDto)
      expect(res).rejects.toThrowError()
    })
    it('should throw unauthorized exception when credential misMatched', async () => {
      const loginDto = {
        email: 'hafiz@gmail.com',
        password: "password"
      }
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false)
      const res = authService.login(loginDto)
      expect(res).rejects.toThrowError()
    })


  })


});
