
export interface DownloadPreferences {
  fileFormat: 'png' | 'jpg';
}

class DownloadService {
  private static STORAGE_KEY = 'sox-lab-download-preferences';

  // 获取保存的下载偏好
  getPreferences(): DownloadPreferences {
    const saved = localStorage.getItem(DownloadService.STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Failed to parse download preferences:', error);
      }
    }
    return {
      fileFormat: 'png'
    };
  }

  // 保存下载偏好
  savePreferences(preferences: DownloadPreferences): void {
    localStorage.setItem(DownloadService.STORAGE_KEY, JSON.stringify(preferences));
  }

  // 生成文件名
  generateFileName(designName: string, format: 'png' | 'jpg' = 'png'): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const safeName = designName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
    return `${safeName}_${timestamp}.${format}`;
  }

  // 简化的下载图片功能
  async downloadImage(imageUrl: string, designName: string): Promise<boolean> {
    try {
      const prefs = this.getPreferences();
      const fileName = this.generateFileName(designName, prefs.fileFormat);

      // 获取图片数据
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }
      
      const blob = await response.blob();

      // 直接使用浏览器默认下载
      return this.downloadWithAnchorTag(blob, fileName);
    } catch (error) {
      console.error('Download failed:', error);
      return false;
    }
  }

  // 使用传统的 a 标签下载到浏览器默认文件夹
  private downloadWithAnchorTag(blob: Blob, fileName: string): boolean {
    try {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 清理 URL 对象
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
      return true;
    } catch (error) {
      console.error('Anchor tag download failed:', error);
      return false;
    }
  }
}

export const downloadService = new DownloadService();
