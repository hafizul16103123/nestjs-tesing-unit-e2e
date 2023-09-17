import { BadRequestException } from "@nestjs/common"
import { getModelToken } from "@nestjs/mongoose"
import { Test, TestingModule } from "@nestjs/testing"
import mongoose, { Model } from "mongoose"
import { User } from "src/auth/schemas/user.schema"
import { BookService } from "./book.service"
import { CreateBookDto } from "./dto/create-book.dto"
import { Book, Category } from "./schemas/book.schema"

describe('BookService', () => {
  let bookService: BookService
  let bookModel: Model<Book>

  // mock models
  // book nodel
  const mockBookModel = {
    find: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  }
  const bookModelToken = getModelToken(Book.name);
  const MockBookModelService = {
    provide: bookModelToken,
    useValue: mockBookModel
  }
  // mock book data
  const mockBook = {
    _id: '61c0ccf11d7bf83d153d7c06',
    user: '61c0ccf11d7bf83d153d7c06',
    title: 'New Book',
    description: 'Book Description',
    author: 'Author',
    price: 100,
    category: Category.FANTASY,
  };

  const mockUser = {
    _id: '61c0ccf11d7bf83d153d7c06',
    name: 'Ghulam',
    email: 'ghulam1@gmail.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookService,
        MockBookModelService
      ]
    }).compile()

    bookService = module.get<BookService>(BookService)
    bookModel = module.get<Model<Book>>(bookModelToken)
  })

  describe('create', () => {

    it('should create a book and return created Book', async () => {
      const mockNewBook = {
        title: 'New Book',
        description: 'Book Description',
        author: 'Author',
        price: 100,
        category: Category.FANTASY,
      };

      jest.spyOn(bookModel, "create").mockImplementationOnce(() => Promise.resolve(mockBook))

      const res = await bookService.create(mockNewBook as CreateBookDto, mockUser as User)
      expect(res).toEqual(mockBook)
    })

  })

  describe('updateById', () => {
    it('should update and return a book', async () => {

      const updatedBook = { ...mockBook, title: 'Updated name' };
      const book = { title: 'Updated name' };

      jest.spyOn(bookModel, 'findByIdAndUpdate').mockResolvedValue(updatedBook);

      const result = await bookService.updateById(mockBook._id, book as any);

      expect(bookModel.findByIdAndUpdate).toHaveBeenCalledWith(mockBook._id, book, {
        new: true,
        runValidators: true,
      });

      expect(result.title).toEqual(book.title);
    });
  });

  describe('findById', () => {

    it('should return a book', async () => {
      jest.spyOn(bookModel, 'findById').mockResolvedValue(mockBook)
      const result = await bookService.findById(mockBook._id)

      expect(bookModel.findById).toHaveBeenCalledWith(mockBook._id)
      expect(result).toEqual(mockBook)

    })

    it('should throw BadRequestException if id is invalid', () => {
      const id = "invalid-id"
      jest.spyOn(mongoose, 'isValidObjectId').mockReturnValue(false)
      const result = bookService.findById(id)

      expect(result).rejects.toThrow(BadRequestException)
      expect(mongoose.isValidObjectId).toHaveBeenCalledWith(id)

    })

    it('should throw NotFoundException if book not found', async () => {
      jest.spyOn(bookModel, 'findById').mockResolvedValue(null)
      const result = bookService.findById(mockBook._id)

      expect(result).rejects.toThrowError()
      expect(bookModel.findById).toHaveBeenCalledWith(mockBook._id)

    })


  })

  describe('findAll', () => {

    it('should retuen array of books', async () => {

      jest.spyOn(bookModel, 'find').mockImplementation(() => ({
        limit: () => ({
          skip: jest.fn().mockResolvedValue([mockBook])
        })
      } as any))
      const query = { page: "1", keyword: 'test' }
      const result = await bookService.findAll(query)

      expect(result).toEqual([mockBook])
      expect(bookModel.find).toHaveBeenCalledWith({
        title: {
          $regex: 'test',
          $options: 'i',
        },
      })


    })

  })
  
  describe('deleteById', () => {
    it('should delete and return a book', async () => {
      jest.spyOn(bookModel, 'findByIdAndDelete').mockResolvedValue(mockBook);
      
      const result = await bookService.deleteById(mockBook._id);

      expect(bookModel.findByIdAndDelete).toHaveBeenCalledWith(mockBook._id);

      expect(result).toEqual(mockBook);
    });
  });


})