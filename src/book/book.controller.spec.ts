import { PassportModule } from "@nestjs/passport"
import { Test, TestingModule } from "@nestjs/testing"
import { User } from "src/auth/schemas/user.schema"
import { BookController } from "./book.controller"
import { BookService } from "./book.service"
import { CreateBookDto } from "./dto/create-book.dto"
import { UpdateBookDto } from "./dto/update-book.dto"
import { Category } from "./schemas/book.schema"

describe('BookController', () => {
    let bookController: BookController
    let bookService: BookService
    //mock data
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
    // mock book service
    const mockBookService = {
        findAll: jest.fn().mockResolvedValueOnce([mockBook]),
        create: jest.fn().mockResolvedValue(mockBook),
        findById: jest.fn().mockResolvedValueOnce(mockBook),
        updateById: jest.fn().mockResolvedValueOnce({ ...mockBook, title: 'updated name' }),
        deleteById: jest.fn().mockResolvedValueOnce({ deleted: true }),
    };
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
            controllers: [BookController],
            providers: [{ provide: BookService, useValue: mockBookService }]
        }).compile()

        bookController = module.get<BookController>(BookController)
        bookService = module.get<BookService>(BookService)
    })

    it('should be defined', () => {
        expect(bookController).toBeDefined()
    })
    it('book service should be defined', () => {
        expect(BookService).toBeDefined()
    })

    describe('getAllBooks', () => {
        it('should return list oof books', async () => {
            const res = await bookController.getAllBooks({ page: "1", keyword: 'test' })
            expect(bookService.findAll).toHaveBeenCalled();
            expect(res).toEqual([mockBook])
        })
    })

    describe('createBook', () => {
        it('should create a book and return that', async () => {
            const newBook = {
                title: 'New Book',
                description: 'Book Description',
                author: 'Author',
                price: 100,
                category: Category.FANTASY,
            };
            const res = await bookController.createBook(newBook as CreateBookDto, mockUser as User)
            expect(bookService.create).toHaveBeenCalled();
            expect(res).toEqual(mockBook)
        })
    })

    describe('getBook', () => {
        it('should return a book by id', async () => {
            const newBook = {
                title: 'New Book',
                description: 'Book Description',
                author: 'Author',
                price: 100,
                category: Category.FANTASY,
            };
            const res = await bookController.getBook(mockBook._id)
            expect(bookService.findById).toHaveBeenCalled();
            expect(res).toEqual(mockBook)
        })
    })
    describe('updateBook', () => {
        it('should return updated book by id', async () => {
            const book = {
                title: 'updated name'
            };
            const res = await bookController.updateBook(mockBook._id, book as UpdateBookDto)
            expect(bookService.updateById).toHaveBeenCalled();
            expect(res).toEqual({ ...mockBook, title: 'updated name' })
        })
    })
    describe('deleteBook', () => {
        it('should delete a book by id', async () => {
            const res = await bookController.deleteBook(mockBook._id)
            expect(bookService.deleteById).toHaveBeenCalled();
            expect(res).toEqual({ deleted: true })
        })
    })

})