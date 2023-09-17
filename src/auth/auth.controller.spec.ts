import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let authService: AuthService;
  let authController: AuthController;

  const mockUser = {
    _id: '61c0ccf11d7bf83d153d7c06',
    name: 'Ghulam',
    email: 'ghulam1@gmail.com',
  };

  let jwtToken = 'jwtToken';

  const mockAuthService = {
    signUp: jest.fn().mockResolvedValueOnce(jwtToken),
    login: jest.fn().mockResolvedValueOnce(jwtToken),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    authController = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });
  it('should be defined authService', () => {
    expect(authService).toBeDefined();
  });

  describe('signup', () => {
    it('should register a new user', async() => {
      const signUpDto = {
        name: 'Ghulam',
        email: 'ghulam1@gmail.com',
        password: '12345678',
      };

      const res = await authController.signUp(signUpDto)
      expect(authService.signUp).toHaveBeenCalled()
      expect(res).toEqual(jwtToken)
    })

  });
  describe('login', () => {
    it('should login a new user', async () => {
      const loginDto = {
        email: 'ghulam1@gmail.com',
        password: '12345678',
      };

      const res = await authController.login(loginDto)
      expect(authService.login).toHaveBeenCalled()
      expect(res).toEqual(jwtToken)
    })

  });
});
