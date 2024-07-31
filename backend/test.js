import * as Minio from 'minio'

const minioClient = new Minio.Client({
  endPoint: 'minio1',
  port: 9000,
  useSSL: false,
  accessKey: 'admin',
  secretKey: '12345678',
})