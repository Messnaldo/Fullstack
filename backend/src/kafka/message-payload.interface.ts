export interface MessagePayload {
   
    value: string;
    partition: number;
    headers: any;
    timestamp: string;
  }

export interface CSVPayload {
  key:string| null;
  value: string;
  partition: number;
  headers: any;
  timestamp: string;

}