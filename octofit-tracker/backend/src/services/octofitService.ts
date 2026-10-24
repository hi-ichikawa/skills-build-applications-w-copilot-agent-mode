import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

function httpError(message: string, status: number) {
  return Object.assign(new Error(message), { status });
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw httpError('Valid activity input is required', 400);
  }

  const { userId, teamId, type, minutes } = input as {
    userId?: unknown;
    teamId?: unknown;
    type?: unknown;
    minutes?: unknown;
  };
  if (
    typeof userId !== 'string'
    || typeof teamId !== 'string'
    || typeof type !== 'string'
    || !type.trim()
    || typeof minutes !== 'number'
    || !Number.isInteger(minutes)
    || minutes < 1
  ) {
    throw httpError('userId, teamId, type, and valid minutes are required', 400);
  }
  if (!mongoose.isObjectIdOrHexString(userId) || !mongoose.isObjectIdOrHexString(teamId)) {
    throw httpError('Invalid userId or teamId', 400);
  }

  const [user, team] = await Promise.all([
    User.findById(userId).select('_id').lean(),
    Team.findById(teamId).select('_id').lean(),
  ]);
  if (!user || !team) {
    throw httpError('User or team does not exist', 404);
  }

  const activity = await Activity.create({
    user: user._id,
    team: team._id,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
  return activity.toObject();
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw httpError('Valid team input is required', 400);
  }

  const { name, mascot, members = [] } = input as {
    name?: unknown;
    mascot?: unknown;
    members?: unknown;
  };
  if (typeof name !== 'string' || !name.trim()) {
    throw httpError('Team name is required', 400);
  }
  if (!Array.isArray(members)) {
    throw httpError('Team members must be an array of user IDs', 400);
  }
  if (!members.every((member) => typeof member === 'string' && mongoose.isObjectIdOrHexString(member))) {
    throw httpError('Invalid team member ID', 400);
  }

  const memberIds = [...new Set(members as string[])];
  const foundMembers = await User.find({ _id: { $in: memberIds } }).select('_id').lean();
  if (foundMembers.length !== memberIds.length) {
    throw httpError('One or more team members do not exist', 404);
  }

  const team = await Team.create({
    name: name.trim(),
    mascot: typeof mascot === 'string' ? mascot.trim() : '',
    members: foundMembers.map((member) => member._id),
  });
  await User.updateMany(
    { _id: { $in: foundMembers.map((member) => member._id) } },
    { $set: { team: team._id } },
  );
  return team.toObject();
}

export async function getLeaderboard() {
  const totals = await Activity.aggregate<{ _id: mongoose.Types.ObjectId; totalPoints: number }>([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    { $sort: { totalPoints: -1 } },
  ]);
  if (totals.length === 0) return [];

  const teams = await Team.find({ _id: { $in: totals.map(({ _id }) => _id) } })
    .select('_id name')
    .lean();
  const teamNames = new Map(teams.map((team) => [team._id.toString(), team.name]));

  return totals
    .filter(({ _id }) => teamNames.has(_id.toString()))
    .map(({ _id, totalPoints }, index) => ({
      teamName: teamNames.get(_id.toString()) as string,
      totalPoints,
      rank: index + 1,
    }));
}

export async function suggestWorkouts(_userEmail: string) {
  return Workout.find().limit(1).lean();
}

export { User };
