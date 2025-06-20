
export interface DownloadPreferences {
  defaultPath?: string;
  rememberPath: boolean;
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
      rememberPath: false,
      fileFormat: 'png'
    };
  }

  // 保存下载偏好
  savePreferences(preferences: DownloadPreferences): void {
    localStorage.setItem(DownloadService.STORAGE_KEY, JSON.stringify(preferences));
  }

  // 检查是否已设置默认路径
  hasDefaultPath(): boolean {
    const prefs = this.getPreferences();
    return prefs.rememberPath && !!prefs.defaultPath;
  }

  // 生成文件名
  generateFileName(designName: string, format: 'png' | 'jpg' = 'png'): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const safeName = designName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
    return `${safeName}_${timestamp}.${format}`;
  }

  // 下载图片
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

      // 检查是否支持 File System Access API 且已设置路径
      if ('showDirectoryPicker' in window && prefs.defaultPath && prefs.rememberPath) {
        return await this.downloadWithFileSystemAPI(blob, fileName);
      } else {
        // 使用传统下载方式
        return this.downloadWithAnchorTag(blob, fileName);
      }
    } catch (error) {
      console.error('Download failed:', error);
      return false;
    }
  }

  // 使用 File System Access API 下载
  private async downloadWithFileSystemAPI(blob: Blob, fileName: string): Promise<boolean> {
    try {
      // 注意：由于浏览器安全限制，每次都需要用户授权
      // 这里主要使用传统方式，但保留 API 调用结构以备将来扩展
      console.log('Using File System API for download');
      return this.downloadWithAnchorTag(blob, fileName);
    } catch (error) {
      console.error('File System API download failed:', error);
      return this.downloadWithAnchorTag(blob, fileName);
    }
  }

  // 使用传统的 a 标签下载
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

  // 设置默认下载路径
  setDefaultPath(path: string): void {
    const prefs = this.getPreferences();
    this.savePreferences({
      ...prefs,
      defaultPath: path,
      rememberPath: true
    });
  }

  // 清除默认路径
  clearDefaultPath(): void {
    const prefs = this.getPreferences();
    this.savePreferences({
      ...prefs,
      defaultPath: undefined,
      rememberPath: false
    });
  }

  // 检查浏览器是否支持文件夹选择
  isDirectoryPickerSupported(): boolean {
    return 'showDirectoryPicker' in window;
  }
}

export const downloadService = new DownloadService();
