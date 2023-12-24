// fileModel.ts
import { prop, getModelForClass } from '@typegoose/typegoose';
class FileModel {
  @prop({ type: () => String, required: true, index: true }) // Index on userId
  userEmailId!: string;

  @prop({ type: () => String,}) // Index on fileId
  fileId!: string;

  @prop({ type: () => String,}) // Index on fileId
  fileName!: string;

  @prop({ default: () => new Date(), type: () => Date }) 
  createdAt!: Date;
}

const FileModelTypegoose = getModelForClass(FileModel);

export { FileModelTypegoose };
