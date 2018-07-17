import Joi from 'joi';
import dotEnv from 'dotenv';

// load vars from .env into PROCESS.ENV
dotEnv.config();

// define validation for all the env vars
const envVarsSchema = Joi.object({
    USERNAME: Joi.string()
        .required()
        .description('The username of an admin'),
    PASSWORD: Joi.string()
        .required()
        .description('The user\'s password'),
    OPENMRSURL: Joi.string()
        .required()
        .description('The url to openMRS'),
}).unknown()
  .required();

const { error, value: envVars } = Joi.validate(process.env, envVarsSchema);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
    username: envVars.USERNAME,
    password: envVars.PASSWORD,
    openMRSUrl: envVars.OPENMRSURL,
};

export default config; 
