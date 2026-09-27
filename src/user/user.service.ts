import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import * as bcrypt from 'bcrypt'

@Injectable()
export class UserService {
  constructor(
    private readonly databaseService: DatabaseService
  ) { }
  async create(createUserDto: Prisma.UserCreateInput) {
    const passwordHash = await bcrypt.hash(createUserDto.account?.create?.passwordHash ?? '', 6)
    const user = await this.databaseService.user.create({
      data: {
        nome: createUserDto.nome,
        sobrenome: createUserDto.sobrenome,
        idade: createUserDto.idade,
        email: createUserDto.email,
        sexo: createUserDto.sexo,
        cpf: createUserDto.cpf,
        
        account: {
          create: {
            passwordHash
          }
        }
      }
    })

    return {
      user,
      mensagem: "Usuario criado com sucesso"
    }
  }

  async findAll() {
    const user = await this.databaseService.user.findMany({})

    if (user.length == 0) {
      console.log(user)
      throw new NotFoundException("Usuario não encontrado")
    }

    return {
      user
    }
  }

  async findOne(id: string) {
    const user = await this.databaseService.user.findUnique({
      where: { id }
    })

    if (!user) {
      throw new NotFoundException(`ID: ${id} invalido`)
    }

    return {
      user
    }
  }

  async update(id: string, updateUserDto: Prisma.UserUpdateInput) {
    const user = await this.databaseService.user.update({
      where: {id},
      data: {
        nome: updateUserDto.nome,
        sobrenome: updateUserDto.sobrenome,
        idade: updateUserDto.idade,
        foto: updateUserDto?.foto
      }
    })


    return {
      mensagem: `Os dados de ${user.nome} foram atualizados`
    }
  }

  async remove(id: string) {
    const user = await this.databaseService.user.delete({
      where: { id }
    })

    if (!user) {
      throw new NotFoundException(`ID: ${id} invalido`)
    }

    return {
      mensagem: `O usuario de ${user.nome} foi excluido com sucesso`
    }
  }
}
