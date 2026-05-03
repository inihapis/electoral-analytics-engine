import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dashboard Pemenangan HIPMI API',
      version: '1.0.0',
      description: 'API untuk sistem monitoring dukungan BPD menuju target 96 suara',
      contact: {
        name: 'HIPMI Pemenangan Team',
      },
    },
    servers: [
      {
        url: (process.env.API_URL || 'http://localhost:5000') + '/api',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            role: { 
              type: 'string', 
              enum: ['SUPERADMIN', 'ADMIN', 'USER'] 
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Bpd: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            provinceName: { type: 'string' },
            totalVotes: { type: 'integer' },
            targetMc: { type: 'string' },
            politicalAffiliation: { type: 'string' },
            supportStatus: { 
              type: 'string', 
              enum: ['LOCKED', 'LEAN', 'SWING'] 
            },
            characteristic: { 
              type: 'string', 
              enum: ['SOLID', 'RENTAN', 'WASPADA'] 
            },
            suratBaiat: { type: 'boolean' },
            afiliasiPolitik: { type: 'boolean' },
            videoDukungan: { type: 'boolean' },
            kedekatanMc: { type: 'boolean' },
            atributFisik: { type: 'boolean' },
            sosialMedia: { type: 'boolean' },
            score: { type: 'number' },
            estimatedVotes: { type: 'number' },
            updatedAt: { type: 'string', format: 'date-time' },
            updatedBy: { $ref: '#/components/schemas/User' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: { type: 'string' },
            password: { type: 'string' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: { $ref: '#/components/schemas/User' },
          },
        },
        StatsSummary: {
          type: 'object',
          properties: {
            totalDukungan: { type: 'number' },
            totalEfektif: { type: 'number' },
            progress: { type: 'number' },
            terkunci: { type: 'integer' },
            mengarah: { type: 'integer' },
            dinamis: { type: 'integer' },
            solid: { type: 'integer' },
            rentan: { type: 'integer' },
            waspada: { type: 'integer' },
            totalBpds: { type: 'integer' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };
