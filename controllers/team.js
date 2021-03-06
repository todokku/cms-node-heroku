const { errorHandler } = require('../helpers/dbErrorHandler');
const Team = require('../models/teams');

exports.addTeam = (req, res) => {
    const team = new Team(req.body);
    console.log(req.body)
    team.save((err, team) => {
        if (err) {
			return res.status(400).json({
				err: errorHandler(err),
			});
        }
        res.json({
            team
        })
    });
};

exports.getTeams = (req, res) => {
	const order = req.query.orderBy ? req.query.orderBy : 'asc';
    const sort = req.query.sortBy ? req.query.sortBy : '_id';
    const limit = req.query.limit ? parseInt(req.query.limit) : 3;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const skip = (page - 1)*limit
	
	Team.find({ user: req.profile._id })
		.sort([[ sort, order ]])
        .limit(limit)
        .skip(skip)
		.exec((err, teams) => {
			Team.countDocuments({ user: req.profile._id })
				.exec((error, totalPages) => {
					if (!error) {
						if (err) {
							return res.status(400).json({
								error: 'teams not found'
							});
						}
						res.json({
							totalPages: Math.ceil(totalPages/limit),
                            page,
                            result: teams
						});
					}
			});
		});
};

exports.teamById = (req, res, next, id) => {
	Team.findById(id).exec((err, team) => {
		if (err || !team) {
			res.status(400).json({
				error: 'No team found',
			});
		}
		req.team = team;
		next();
	});
};

exports.getTeam = (req, res) => {
    return res.json(req.team);
}
