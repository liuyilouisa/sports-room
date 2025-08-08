import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity';
import { RegisterDTO } from '../dto/auth.dto';
import * as bcrypt from 'bcryptjs';

@Provide()
export class UserService {
  @InjectEntityModel(User)
  userRepo: Repository<User>;

  async create(dto: RegisterDTO) {
    const exists = await this.userRepo.findOne({ where: { email: dto.email } });
    if (exists) throw new Error('邮箱已存在');
    const user = this.userRepo.create({
      ...dto,
      password: await bcrypt.hash(dto.password, 10),
    });
    return this.userRepo.save(user);
  }

  async validateAndGet(email: string, plain: string): Promise<User | null> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(plain, user.password))) {
      return null;
    }
    return user;
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }
}
