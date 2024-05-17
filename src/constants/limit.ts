export const Limit = {
  postBodyMaxLength: 4096,
  postMaxImgLength: 9,
  postVoteMaxLength: 5,
  postVoteOptionLength: 20,
  postTagsMaxLength: 5,
  postCommentBodyMaxLength: 1000,
  postCommentBodyMinLength: 1,
  commentMaxImgLength: 2,
  reportReasonMaxLength: 500,
  reportReasonMinLength: 10,
  post: {
    maxInfoCommentBodyLength: 30,
    titleMaxLength: 20,
  },
  user: {
    minUsernameLength: 1,
    maxUsernameLength: 10,
  },
  level: {
    post: 5,
    comment: 3,
    reply: 3,
  },
}
