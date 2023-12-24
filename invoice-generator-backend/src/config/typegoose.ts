
import { connect } from 'mongoose';


const connectDB = async () => {
  try {
    const uri = process.env.MongoDB_URL
    if(uri==undefined)
    {
      console.log("Mongo Uri is empty")
      process.exit(0);
    }
    await connect(uri), { dbName: 'invoice-generator-db' };


    console.log("mongodb connected")
 
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(0)
  }
};

export { connectDB };
