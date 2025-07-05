import { aiApi } from '../src/api/aiApi';

// 用于测试AI分析接口的返回结构和数据
async function testAIAnalysis(newsId, isEvent = false) {
  try {
    console.log('--- 测试 getAnalysis ---');
    const analysisType = isEvent ? 'event' : 'news';
    const existingAnalysis = await aiApi.getAnalysis(analysisType, newsId);
    console.log('getAnalysis 返回:', existingAnalysis);

    if (!existingAnalysis || !existingAnalysis.data) {
      console.log('无现有分析，尝试生成新分析...');
      let response;
      if (isEvent) {
        response = await aiApi.analyzeEvent(newsId, {
          enableSummary: true,
          enableKeywords: true,
          enableSentiment: true,
          enableTrends: true,
          enableImpact: true,
          showAnalysisSteps: false
        });
      } else {
        response = await aiApi.analyzeNews(newsId, {
          enableSummary: true,
          enableKeywords: true,
          enableSentiment: true,
          enableTrends: false,
          enableImpact: false,
          showAnalysisSteps: false
        });
      }
      console.log('生成分析返回:', response);
    }
  } catch (err) {
    console.error('AI分析接口测试出错:', err);
  }
}

// 请替换为实际存在的 newsId 进行测试
const testNewsId = 1;
testAIAnalysis(testNewsId, false); // 测试新闻分析
// testAIAnalysis(testNewsId, true); // 测试事件分析（如有事件ID）
