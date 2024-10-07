export const idlFactory = ({ IDL }) => {
  const CreatePollRequest = IDL.Record({
    'duration' : IDL.Nat,
    'question' : IDL.Text,
    'options' : IDL.Vec(IDL.Text),
  });
  const PollId = IDL.Nat;
  const Result_2 = IDL.Variant({ 'ok' : PollId, 'err' : IDL.Text });
  const UserId = IDL.Principal;
  const Poll = IDL.Record({
    'id' : PollId,
    'creator' : UserId,
    'question' : IDL.Text,
    'votes' : IDL.Vec(IDL.Nat),
    'voters' : IDL.Vec(UserId),
    'created_at' : IDL.Int,
    'expires_at' : IDL.Int,
    'options' : IDL.Vec(IDL.Text),
  });
  const Result_1 = IDL.Variant({ 'ok' : Poll, 'err' : IDL.Text });
  const VoteRequest = IDL.Record({
    'poll_id' : PollId,
    'option_index' : IDL.Nat,
  });
  const Result = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  return IDL.Service({
    'create_poll' : IDL.Func([CreatePollRequest], [Result_2], []),
    'get_poll' : IDL.Func([PollId], [Result_1], ['query']),
    'list_polls' : IDL.Func([], [IDL.Vec(Poll)], ['query']),
    'vote' : IDL.Func([VoteRequest], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
