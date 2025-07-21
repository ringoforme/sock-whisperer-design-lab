
export interface Message {
  id: number;
  text: string;
  isUser: boolean;
  detail_image_url?: string;
  brief_image_url?: string;
  designName?: string;
  isSelected?: boolean;
}
