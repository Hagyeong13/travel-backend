import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Travel Backend API',
      version: '1.0.0',
      description: '여행 플래너 백엔드 API 문서'
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Local server'
      }
    ],
    components: {
      securitySchemes: {
        MemberIdHeader: {
          type: 'apiKey',
          in: 'header',
          name: 'X-Member-Id'
        }
      },
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            code: { type: 'string', example: 'OK' },
            message: { type: 'string', example: '요청이 성공했습니다.' },
            data: { type: 'object', nullable: true }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            code: { type: 'string', example: 'ROOM_40401' },
            message: { type: 'string', example: '존재하지 않는 방입니다.' },
            data: { type: 'object', nullable: true, example: null }
          }
        }
      }
    }
  },
  apis: ['./src/modules/**/controllers/*.js']
};

export const swaggerSpec = swaggerJsdoc(options);
export { swaggerUi };