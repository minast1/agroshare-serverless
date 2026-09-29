import { createLogger } from "../../utils/logger"

export class UsersService {
    private static logger = createLogger("UsersService")

    static async findAll() {
        this.logger.info("Fetching all users")
        return [{ id: '1', name: 'John Doe' }, { id: '2', name: 'Jane Doe' }]
    }

    static async findById(id: string) {
        this.logger.info(`Fetching user with id ${id}`)
        const users = [{ id: '1', name: 'John Doe' }]
        return users.find(u => u.id === id) || null
    }

    static async create(data: { name: string, email: string, age: number }) {
        const { name, email, age } = data
        const user = { id: Date.now().toString(), name, email, age }
        return user
    }

    static async updateById(id: string, data: { name: string }) {
        const { name } = data
        const user = { id, name }
        return user
    }

    static async deleteById(id: string) {
        const user = { id }
        return user
    }
}