
import { Design } from '@/types/design';
import { DesignExample } from '@/data/designExamples';

class TempDesignService {
  private tempDesigns = new Map<string, Design>();

  createTempDesignFromExample(example: DesignExample): Design {
    const tempDesign: Design = {
      id: `temp_${example.id}_${Date.now()}`,
      imageUrl: example.imageUrl,
      title: example.title,
      createdAt: new Date().toISOString(),
      type: 'edited',
      originalPrompt: example.prompt
    };

    // 存储到内存中
    this.tempDesigns.set(tempDesign.id, tempDesign);
    
    // 同时存储到sessionStorage作为备份
    sessionStorage.setItem(`temp_design_${tempDesign.id}`, JSON.stringify(tempDesign));
    
    return tempDesign;
  }

  getTempDesign(designId: string): Design | null {
    // 先从内存中获取
    const memoryDesign = this.tempDesigns.get(designId);
    if (memoryDesign) {
      return memoryDesign;
    }

    // 从sessionStorage中获取
    const storageDesign = sessionStorage.getItem(`temp_design_${designId}`);
    if (storageDesign) {
      try {
        const design = JSON.parse(storageDesign);
        this.tempDesigns.set(designId, design);
        return design;
      } catch (error) {
        console.error('Failed to parse temp design from storage:', error);
      }
    }

    return null;
  }

  removeTempDesign(designId: string): void {
    this.tempDesigns.delete(designId);
    sessionStorage.removeItem(`temp_design_${designId}`);
  }

  isTempDesign(designId: string): boolean {
    return designId.startsWith('temp_');
  }
}

export const tempDesignService = new TempDesignService();
