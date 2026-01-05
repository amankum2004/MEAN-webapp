const clickhouseService = require('../services/clickhouseService');

class GraphController {
  async getGraphData(req, res) {
    try {
      const type = req.params.type;
      let data;

      switch (type) {
        case 'hobby-distribution':
          data = await clickhouseService.getHobbyStats();
          break;
        case 'age-distribution':
          data = await clickhouseService.getAgeDistribution();
          break;
        case 'registration-trend':
          data = await clickhouseService.getRegistrationTrend();
          break;
        default:
          return res.status(400).json({ error: 'Invalid graph type' });
      }

      res.json(data);
    } catch (error) {
      console.error('Error fetching graph data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new GraphController();