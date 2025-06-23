
export interface Message {
  id: number;
  text: string;
  isUser: boolean;
  imageUrl?: string;
  designName?: string;
  isSelected?: boolean;
}
