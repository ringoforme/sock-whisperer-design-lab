
import { ConversationState, ConversationPhase, DesignRequirements } from '@/types/conversation';
import { llmService } from '@/services/llmService';

export class ConversationManager {
  private state: ConversationState;

  constructor() {
    this.state = {
      phase: 'welcome',
      requirements: {},
      collectedInfo: [],
      isComplete: false
    };
  }

  public getState(): ConversationState {
    return { ...this.state };
  }

  public updatePhase(phase: ConversationPhase): void {
    this.state.phase = phase;
  }

  public updateRequirements(updates: Partial<DesignRequirements>): void {
    this.state.requirements = { ...this.state.requirements, ...updates };
    this.updateCollectedInfo();
  }

  private updateCollectedInfo(): void {
    const info: string[] = [];
    const req = this.state.requirements;
    
    if (req.sockType) info.push(`袜子类型: ${this.getSockTypeLabel(req.sockType)}`);
    if (req.colors?.length) info.push(`颜色: ${req.colors.join(', ')}`);
    if (req.pattern) info.push(`图案: ${this.getPatternLabel(req.pattern)}`);
    if (req.occasion) info.push(`场合: ${this.getOccasionLabel(req.occasion)}`);
    if (req.style) info.push(`风格: ${this.getStyleLabel(req.style)}`);
    
    this.state.collectedInfo = info;
    this.state.isComplete = this.checkIfComplete();
  }

  private checkIfComplete(): boolean {
    const req = this.state.requirements;
    return !!(req.sockType && req.colors?.length && req.pattern && req.occasion);
  }

  public async generateResponse(userMessage: string): Promise<string> {
    const lowerMessage = userMessage.toLowerCase();
    
    // 如果LLM服务已配置，使用真实的GPT回复
    if (llmService.isConfigured()) {
      try {
        const context = `你是Sox Lab袜子设计工作室的专业AI助手。

当前对话阶段: ${this.state.phase}
已收集信息: ${JSON.stringify(this.state.requirements, null, 2)}
用户消息: ${userMessage}

请根据当前阶段和已收集的信息，用中文回复用户。如果需要收集更多设计信息，请引导用户提供。`;
        
        const response = await llmService.sendMessage(context);
        if (response.success) {
          return response.message;
        }
      } catch (error) {
        console.error('GPT API调用失败，使用结构化回复:', error);
      }
    }
    
    // 降级到结构化对话流程
    switch (this.state.phase) {
      case 'welcome':
        return this.handleWelcomePhase(lowerMessage);
      case 'collecting_type':
        return this.handleTypeCollection(lowerMessage);
      case 'collecting_colors':
        return this.handleColorCollection(lowerMessage);
      case 'collecting_pattern':
        return this.handlePatternCollection(lowerMessage);
      case 'collecting_occasion':
        return this.handleOccasionCollection(lowerMessage);
      case 'collecting_style':
        return this.handleStyleCollection(lowerMessage);
      case 'confirming':
        return this.handleConfirmation(lowerMessage);
      case 'ready_to_generate':
        return this.handleReadyToGenerate(lowerMessage);
      case 'editing_feedback':
        return this.handleEditingFeedback(lowerMessage);
      default:
        return "让我们重新开始，请告诉我您想要什么样的袜子设计？";
    }
  }

  private handleWelcomePhase(message: string): string {
    this.updatePhase('collecting_type');
    return "太好了！让我们开始设计您的专属袜子。首先，您希望设计什么类型的袜子？\n\n" +
           "• 船袜/短袜 - 适合运动和日常\n" +
           "• 中筒袜 - 经典选择，适合多种场合\n" +
           "• 长筒袜 - 时尚保暖，适合秋冬\n" +
           "• 过膝袜 - 个性时尚，适合特殊场合";
  }

  private handleTypeCollection(message: string): string {
    let sockType: DesignRequirements['sockType'];
    
    if (message.includes('船袜') || message.includes('短袜') || message.includes('ankle')) {
      sockType = 'ankle';
    } else if (message.includes('中筒') || message.includes('crew')) {
      sockType = 'crew';
    } else if (message.includes('长筒') || message.includes('knee')) {
      sockType = 'knee-high';
    } else if (message.includes('过膝') || message.includes('thigh')) {
      sockType = 'thigh-high';
    }

    if (sockType) {
      this.updateRequirements({ sockType });
      this.updatePhase('collecting_colors');
      return `很好！${this.getSockTypeLabel(sockType)}是个不错的选择。\n\n` +
             "现在让我们来谈谈颜色。您喜欢什么颜色呢？可以是单色或者多色搭配，比如：\n" +
             "• 经典色系：黑色、白色、灰色\n" +
             "• 活力色系：红色、蓝色、黄色\n" +
             "• 柔和色系：粉色、薄荷绿、淡紫色\n" +
             "• 或者告诉我您的具体想法！";
    }

    return "请选择袜子类型：船袜、中筒袜、长筒袜或过膝袜？";
  }

  private handleColorCollection(message: string): string {
    const colors = this.extractColors(message);
    
    if (colors.length > 0) {
      this.updateRequirements({ colors });
      this.updatePhase('collecting_pattern');
      return `${colors.join('、')}的搭配听起来很棒！\n\n` +
             "接下来，您希望袜子上有什么样的图案呢？\n" +
             "• 几何图案 - 简约现代\n" +
             "• 动物图案 - 可爱有趣\n" +
             "• 花卉图案 - 优雅自然\n" +
             "• 抽象艺术 - 独特个性\n" +
             "• 文字图案 - 表达态度\n" +
             "• 节日主题 - 应景特色\n" +
             "• 运动元素 - 活力动感\n" +
             "• 或者纯色无图案也很经典";
    }

    return "请告诉我您喜欢的颜色，可以是单色或多色搭配。";
  }

  private handlePatternCollection(message: string): string {
    let pattern: DesignRequirements['pattern'];
    
    if (message.includes('几何') || message.includes('geometric')) pattern = 'geometric';
    else if (message.includes('动物') || message.includes('animal')) pattern = 'animal';
    else if (message.includes('花') || message.includes('floral')) pattern = 'floral';
    else if (message.includes('抽象') || message.includes('abstract')) pattern = 'abstract';
    else if (message.includes('文字') || message.includes('text')) pattern = 'text';
    else if (message.includes('节日') || message.includes('holiday')) pattern = 'holiday';
    else if (message.includes('运动') || message.includes('sport')) pattern = 'sports';

    if (pattern) {
      this.updateRequirements({ pattern });
      this.updatePhase('collecting_occasion');
      return `${this.getPatternLabel(pattern)}的设计会很有特色！\n\n` +
             "最后，这双袜子主要用于什么场合呢？\n" +
             "• 日常休闲 - 舒适自在\n" +
             "• 运动健身 - 透气功能\n" +
             "• 商务正式 - 低调优雅\n" +
             "• 特殊场合 - 个性表达";
    }

    return "请选择您喜欢的图案类型，或者告诉我您的具体想法。";
  }

  private handleOccasionCollection(message: string): string {
    let occasion: DesignRequirements['occasion'];
    
    if (message.includes('日常') || message.includes('休闲') || message.includes('daily')) occasion = 'daily';
    else if (message.includes('运动') || message.includes('健身') || message.includes('sport')) occasion = 'sport';
    else if (message.includes('商务') || message.includes('正式') || message.includes('business')) occasion = 'business';
    else if (message.includes('特殊') || message.includes('special')) occasion = 'special';

    if (occasion) {
      this.updateRequirements({ occasion });
      this.updatePhase('collecting_style');
      return `好的！${this.getOccasionLabel(occasion)}场合的设计我明白了。\n\n` +
             "还有最后一个问题，您偏好什么样的设计风格？\n" +
             "• 简约风格 - 干净利落\n" +
             "• 大胆风格 - 醒目抢眼\n" +
             "• 可爱风格 - 萌系治愈\n" +
             "• 优雅风格 - 精致高级\n" +
             "• 潮流风格 - 时尚前卫";
    }

    return "请告诉我这双袜子主要用于什么场合？";
  }

  private handleStyleCollection(message: string): string {
    let style: DesignRequirements['style'];
    
    if (message.includes('简约') || message.includes('minimalist')) style = 'minimalist';
    else if (message.includes('大胆') || message.includes('bold')) style = 'bold';
    else if (message.includes('可爱') || message.includes('cute')) style = 'cute';
    else if (message.includes('优雅') || message.includes('elegant')) style = 'elegant';
    else if (message.includes('潮流') || message.includes('时尚') || message.includes('trendy')) style = 'trendy';

    if (style) {
      this.updateRequirements({ style });
      this.updatePhase('confirming');
      return this.generateSummary();
    }

    return "请选择您喜欢的设计风格，或者告诉我您的具体偏好。";
  }

  private handleConfirmation(message: string): string {
    if (message.includes('确认') || message.includes('好的') || message.includes('对') || message.includes('是')) {
      this.updatePhase('ready_to_generate');
      return "完美！现在我已经收集到了所有设计信息。您可以点击"生成图片"按钮来创建您的专属袜子设计，或者继续和我聊天完善细节。";
    } else if (message.includes('修改') || message.includes('改')) {
      this.updatePhase('welcome');
      return "没问题！让我们重新开始设计流程。请告诉我您想要什么样的袜子设计？";
    }
    
    return "请确认设计信息是否正确？如需修改请告诉我具体要改什么。";
  }

  private handleReadyToGenerate(message: string): string {
    return "您的设计信息已经完善！随时可以点击"生成图片"按钮来创建设计，或者告诉我还需要调整什么细节。";
  }

  private handleEditingFeedback(message: string): string {
    return `我记录了您的修改建议："${message}"。当您准备好时，请点击"修改图片"按钮来应用这些改动。如果还有其他调整意见，请继续告诉我。`;
  }

  private generateSummary(): string {
    const req = this.state.requirements;
    return `太棒了！让我总结一下您的设计需求：\n\n` +
           `🧦 袜子类型：${this.getSockTypeLabel(req.sockType!)}\n` +
           `🎨 颜色搭配：${req.colors!.join('、')}\n` +
           `🎭 图案风格：${this.getPatternLabel(req.pattern!)}\n` +
           `👔 使用场合：${this.getOccasionLabel(req.occasion!)}\n` +
           `✨ 设计风格：${this.getStyleLabel(req.style!)}\n\n` +
           `这个设计听起来会很棒！请确认信息是否正确？如果需要修改任何部分，请告诉我。`;
  }

  private extractColors(message: string): string[] {
    const colorMap: Record<string, string> = {
      '黑': '黑色', '白': '白色', '灰': '灰色', '红': '红色', '蓝': '蓝色',
      '绿': '绿色', '黄': '黄色', '紫': '紫色', '粉': '粉色', '橙': '橙色',
      '棕': '棕色', '金': '金色', '银': '银色'
    };
    
    const colors: string[] = [];
    for (const [key, value] of Object.entries(colorMap)) {
      if (message.includes(key)) {
        colors.push(value);
      }
    }
    
    return colors.length > 0 ? colors : ['基础色系'];
  }

  private getSockTypeLabel(type: string): string {
    const labels = {
      'ankle': '船袜/短袜',
      'crew': '中筒袜',
      'knee-high': '长筒袜',
      'thigh-high': '过膝袜'
    };
    return labels[type as keyof typeof labels] || type;
  }

  private getPatternLabel(pattern: string): string {
    const labels = {
      'geometric': '几何图案',
      'animal': '动物图案',
      'floral': '花卉图案',
      'abstract': '抽象艺术',
      'text': '文字图案',
      'holiday': '节日主题',
      'sports': '运动元素'
    };
    return labels[pattern as keyof typeof labels] || pattern;
  }

  private getOccasionLabel(occasion: string): string {
    const labels = {
      'daily': '日常休闲',
      'sport': '运动健身',
      'business': '商务正式',
      'special': '特殊场合'
    };
    return labels[occasion as keyof typeof labels] || occasion;
  }

  private getStyleLabel(style: string): string {
    const labels = {
      'minimalist': '简约风格',
      'bold': '大胆风格',
      'cute': '可爱风格',
      'elegant': '优雅风格',
      'trendy': '潮流风格'
    };
    return labels[style as keyof typeof labels] || style;
  }

  public getCollectedInfo(): string[] {
    return [...this.state.collectedInfo];
  }

  public getRequirements(): DesignRequirements {
    return { ...this.state.requirements };
  }

  public isReadyToGenerate(): boolean {
    return this.state.isComplete;
  }

  public setEditingMode(): void {
    this.updatePhase('editing_feedback');
  }
}
