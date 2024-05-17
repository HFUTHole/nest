-- CreateEnum
CREATE TYPE "notify_interaction_entity_target_enum" AS ENUM ('comment', ' reply', 'post');

-- CreateEnum
CREATE TYPE "notify_interaction_entity_type_enum" AS ENUM ('comment', 'reply', 'like');

-- CreateEnum
CREATE TYPE "report_type_enum" AS ENUM ('post', 'comment', 'reply');

-- CreateEnum
CREATE TYPE "user_gender_enum" AS ENUM ('男', '女');

-- CreateEnum
CREATE TYPE "user_role_enum" AS ENUM ('user', 'admin', 'banned');

-- CreateEnum
CREATE TYPE "vote_type_enum" AS ENUM ('single');

-- CreateTable
CREATE TABLE "comment" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "create_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delete_at" TIMESTAMP(6),
    "body" TEXT NOT NULL,
    "favoriteCounts" INTEGER NOT NULL DEFAULT 0,
    "imgs" TEXT NOT NULL,
    "postId" INTEGER,
    "userId" INTEGER,

    CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "create_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delete_at" TIMESTAMP(6),

    CONSTRAINT "PK_864528ec4274360a40f66c29845" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_user_user" (
    "conversationId" UUID NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "PK_6e6a1f189d97eaef74144d5c493" PRIMARY KEY ("conversationId","userId")
);

-- CreateTable
CREATE TABLE "message" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "create_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delete_at" TIMESTAMP(6),
    "body" VARCHAR NOT NULL,
    "senderId" INTEGER,

    CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notify_interaction_entity" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "create_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delete_at" TIMESTAMP(6),
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "type" "notify_interaction_entity_type_enum" NOT NULL,
    "target" "notify_interaction_entity_target_enum" NOT NULL,
    "creatorId" INTEGER,
    "userId" INTEGER,
    "postId" INTEGER,
    "commentId" UUID,
    "replyId" UUID,
    "body" VARCHAR,

    CONSTRAINT "PK_796ddc9c7bbbf2111bbe133cb77" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notify_system" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "create_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delete_at" TIMESTAMP(6),
    "title" VARCHAR NOT NULL,
    "body" VARCHAR NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER,
    "postId" INTEGER,
    "commentId" UUID,
    "replyId" UUID,

    CONSTRAINT "PK_495d34ceafef7482bef2fc8d98b" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notify_system_completed_reading_users_user" (
    "notifySystemId" UUID NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "PK_95ee13725fbc912fd08039ef9d9" PRIMARY KEY ("notifySystemId","userId")
);

-- CreateTable
CREATE TABLE "post" (
    "id" SERIAL NOT NULL,
    "create_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delete_at" TIMESTAMP(6),
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,
    "body" TEXT NOT NULL,
    "title" TEXT,
    "imgs" TEXT NOT NULL,
    "bilibili" VARCHAR,
    "favoriteCounts" INTEGER NOT NULL DEFAULT 0,
    "userId" INTEGER,
    "voteId" UUID,
    "categoryId" UUID,

    CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_category" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "create_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delete_at" TIMESTAMP(6),
    "name" VARCHAR NOT NULL,
    "description" TEXT NOT NULL,
    "bgUrl" TEXT NOT NULL,

    CONSTRAINT "PK_388636ba602c312da6026dc9dbc" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_tags_tags" (
    "postId" INTEGER NOT NULL,
    "tagsId" UUID NOT NULL,

    CONSTRAINT "PK_11a80b010e4e0a1f7cbfa45088e" PRIMARY KEY ("postId","tagsId")
);

-- CreateTable
CREATE TABLE "reply" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "create_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delete_at" TIMESTAMP(6),
    "body" VARCHAR NOT NULL,
    "imgs" TEXT NOT NULL,
    "favoriteCounts" INTEGER NOT NULL DEFAULT 0,
    "userId" INTEGER,
    "commentId" UUID,
    "parentReplyId" UUID,
    "replyUserId" INTEGER,

    CONSTRAINT "PK_94fa9017051b40a71e000a2aff9" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "create_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delete_at" TIMESTAMP(6),
    "type" "report_type_enum" NOT NULL,
    "reason" VARCHAR NOT NULL,
    "postId" INTEGER,
    "commentId" UUID,
    "replyId" UUID,

    CONSTRAINT "PK_99e4d0bea58cba73c57f935a546" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_user_user" (
    "reportId" UUID NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "PK_998710b285d162a6e6dd92bc568" PRIMARY KEY ("reportId","userId")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "create_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delete_at" TIMESTAMP(6),
    "body" VARCHAR NOT NULL,

    CONSTRAINT "PK_e7dc17249a1148a1970748eda99" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "create_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delete_at" TIMESTAMP(6),
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,
    "studentId" INTEGER NOT NULL,
    "username" VARCHAR NOT NULL,
    "password" VARCHAR NOT NULL,
    "hfutPassword" VARCHAR NOT NULL,
    "gender" "user_gender_enum" NOT NULL,
    "role" "user_role_enum" NOT NULL DEFAULT 'user',
    "avatar" VARCHAR NOT NULL,
    "levelId" UUID,
    "followersId" INTEGER,

    CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_favorite_comment_comment" (
    "userId" INTEGER NOT NULL,
    "commentId" UUID NOT NULL,

    CONSTRAINT "PK_0fbae21ac17297e170050386ead" PRIMARY KEY ("userId","commentId")
);

-- CreateTable
CREATE TABLE "user_favorite_post_post" (
    "userId" INTEGER NOT NULL,
    "postId" INTEGER NOT NULL,

    CONSTRAINT "PK_81f58a77799e30b69801838a0b5" PRIMARY KEY ("userId","postId")
);

-- CreateTable
CREATE TABLE "user_favorite_reply_reply" (
    "userId" INTEGER NOT NULL,
    "replyId" UUID NOT NULL,

    CONSTRAINT "PK_e65e44443fe165e1bec643b0457" PRIMARY KEY ("userId","replyId")
);

-- CreateTable
CREATE TABLE "user_level_entity" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "create_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delete_at" TIMESTAMP(6),
    "level" SMALLINT NOT NULL,
    "nextLevelRequiredExperience" INTEGER NOT NULL,
    "experience" INTEGER NOT NULL,

    CONSTRAINT "PK_d49835b96baa71da64cdcf35614" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_vote_items_vote_item" (
    "userId" INTEGER NOT NULL,
    "voteItemId" UUID NOT NULL,

    CONSTRAINT "PK_5554a61e2e782abf48c9d6df304" PRIMARY KEY ("userId","voteItemId")
);

-- CreateTable
CREATE TABLE "user_votes_vote" (
    "userId" INTEGER NOT NULL,
    "voteId" UUID NOT NULL,

    CONSTRAINT "PK_170543906f6f90715e74b2ae89d" PRIMARY KEY ("userId","voteId")
);

-- CreateTable
CREATE TABLE "vote" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "create_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delete_at" TIMESTAMP(6),
    "type" "vote_type_enum" NOT NULL DEFAULT 'single',
    "endTime" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PK_2d5932d46afe39c8176f9d4be72" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vote_item" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "create_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delete_at" TIMESTAMP(6),
    "option" VARCHAR NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "voteId" UUID,

    CONSTRAINT "PK_fe84957ab91f7210c4f95bd9060" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IDX_0b0e4bbc8415ec426f87f3a88e" ON "comment"("id");

-- CreateIndex
CREATE INDEX "IDX_8e55192f9dcce600c6a5c57f2a" ON "comment"("favoriteCounts");

-- CreateIndex
CREATE INDEX "IDX_e326aed451c3ccd2646d17bad2" ON "comment"("body");

-- CreateIndex
CREATE INDEX "IDX_864528ec4274360a40f66c2984" ON "conversation"("id");

-- CreateIndex
CREATE INDEX "IDX_733629445745e584497e81fee2" ON "conversation_user_user"("conversationId");

-- CreateIndex
CREATE INDEX "IDX_9839909ce6e60e2af0f61d5a54" ON "conversation_user_user"("userId");

-- CreateIndex
CREATE INDEX "IDX_ba01f0a3e0123651915008bc57" ON "message"("id");

-- CreateIndex
CREATE INDEX "IDX_796ddc9c7bbbf2111bbe133cb7" ON "notify_interaction_entity"("id");

-- CreateIndex
CREATE INDEX "IDX_495d34ceafef7482bef2fc8d98" ON "notify_system"("id");

-- CreateIndex
CREATE INDEX "IDX_2f4cbcd7e92ca19bd9660013fa" ON "notify_system_completed_reading_users_user"("notifySystemId");

-- CreateIndex
CREATE INDEX "IDX_eb0b020a8eb5fceef87a90a950" ON "notify_system_completed_reading_users_user"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "REL_a6f1ff575d8d9f6e635598de27" ON "post"("voteId");

-- CreateIndex
CREATE INDEX "IDX_2d1a073c37ebd9a2e7c0f28f38" ON "post"("body");

-- CreateIndex
CREATE INDEX "IDX_3ed7ecdb288770ab3a3d6e1cfe" ON "post"("favoriteCounts");

-- CreateIndex
CREATE INDEX "IDX_be5fda3aac270b134ff9c21cde" ON "post"("id");

-- CreateIndex
CREATE INDEX "IDX_e28aa0c4114146bfb1567bfa9a" ON "post"("title");

-- CreateIndex
CREATE UNIQUE INDEX "UQ_83f78d22e3e01c0fc9af0cd5a25" ON "post_category"("name");

-- CreateIndex
CREATE INDEX "IDX_388636ba602c312da6026dc9db" ON "post_category"("id");

-- CreateIndex
CREATE INDEX "IDX_ba037b6fe8bd028a82b3638467" ON "post_tags_tags"("postId");

-- CreateIndex
CREATE INDEX "IDX_fd01de8916c2da37ddda280846" ON "post_tags_tags"("tagsId");

-- CreateIndex
CREATE INDEX "IDX_16e72c2c0722929b8991139af3" ON "reply"("favoriteCounts");

-- CreateIndex
CREATE INDEX "IDX_94fa9017051b40a71e000a2aff" ON "reply"("id");

-- CreateIndex
CREATE INDEX "IDX_9ccd620572e2bd46877aa2f465" ON "reply"("body");

-- CreateIndex
CREATE INDEX "IDX_99e4d0bea58cba73c57f935a54" ON "report"("id");

-- CreateIndex
CREATE INDEX "IDX_0b5ca52e3e5f5870168c60b6bc" ON "report_user_user"("userId");

-- CreateIndex
CREATE INDEX "IDX_37d87b094a1ffdb2613e898765" ON "report_user_user"("reportId");

-- CreateIndex
CREATE INDEX "IDX_e7dc17249a1148a1970748eda9" ON "tags"("id");

-- CreateIndex
CREATE UNIQUE INDEX "REL_50cb127cc28cf5075eda2fbaa8" ON "user"("levelId");

-- CreateIndex
CREATE INDEX "IDX_2279dce27cfb8d7b0e6e9bbf5c" ON "user"("studentId");

-- CreateIndex
CREATE INDEX "IDX_78a916df40e02a9deb1c4b75ed" ON "user"("username");

-- CreateIndex
CREATE INDEX "IDX_cace4a159ff9f2512dd4237376" ON "user"("id");

-- CreateIndex
CREATE INDEX "IDX_effee35628e49721d3b3d18033" ON "user_favorite_comment_comment"("commentId");

-- CreateIndex
CREATE INDEX "IDX_f6e187c2b9a4358f8e998685be" ON "user_favorite_comment_comment"("userId");

-- CreateIndex
CREATE INDEX "IDX_237368efde87627445bbb33d78" ON "user_favorite_post_post"("postId");

-- CreateIndex
CREATE INDEX "IDX_e9db2a26a78d235de5a90c535d" ON "user_favorite_post_post"("userId");

-- CreateIndex
CREATE INDEX "IDX_65bb39c924197708e90d66f244" ON "user_favorite_reply_reply"("userId");

-- CreateIndex
CREATE INDEX "IDX_da48e0b9607e9c6cda5cee67c8" ON "user_favorite_reply_reply"("replyId");

-- CreateIndex
CREATE INDEX "IDX_d49835b96baa71da64cdcf3561" ON "user_level_entity"("id");

-- CreateIndex
CREATE INDEX "IDX_60bbd864103c3b002b272f5c96" ON "user_vote_items_vote_item"("voteItemId");

-- CreateIndex
CREATE INDEX "IDX_b4d764e397d331002861120f92" ON "user_vote_items_vote_item"("userId");

-- CreateIndex
CREATE INDEX "IDX_1cdd3a9e85dca7f23d032f8837" ON "user_votes_vote"("voteId");

-- CreateIndex
CREATE INDEX "IDX_3d7c5952002bd1c143bc746d07" ON "user_votes_vote"("userId");

-- CreateIndex
CREATE INDEX "IDX_2d5932d46afe39c8176f9d4be7" ON "vote"("id");

-- CreateIndex
CREATE INDEX "IDX_fe84957ab91f7210c4f95bd906" ON "vote_item"("id");

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "FK_94a85bb16d24033a2afdd5df060" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "FK_c0354a9a009d3bb45a08655ce3b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "conversation_user_user" ADD CONSTRAINT "FK_733629445745e584497e81fee2f" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_user_user" ADD CONSTRAINT "FK_9839909ce6e60e2af0f61d5a541" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "FK_bc096b4e18b1f9508197cd98066" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notify_interaction_entity" ADD CONSTRAINT "FK_0544c41b6d812b9e79bf2270159" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notify_interaction_entity" ADD CONSTRAINT "FK_9aa3e2c0d84b8d3379cc8b43d90" FOREIGN KEY ("replyId") REFERENCES "reply"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notify_interaction_entity" ADD CONSTRAINT "FK_cd247a8f2c8ebe03824f10f2a93" FOREIGN KEY ("commentId") REFERENCES "comment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notify_interaction_entity" ADD CONSTRAINT "FK_d24aaf226d4cbc9001a7194b6f5" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notify_interaction_entity" ADD CONSTRAINT "FK_ec5f6ba02c24b142a85236b253a" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notify_system" ADD CONSTRAINT "FK_498e178003307f6ed0eca72bf36" FOREIGN KEY ("commentId") REFERENCES "comment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notify_system" ADD CONSTRAINT "FK_a9b10997868aef790d9b5a9942a" FOREIGN KEY ("replyId") REFERENCES "reply"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notify_system" ADD CONSTRAINT "FK_dd973808b910ee6e8d9a4a1e7cb" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notify_system" ADD CONSTRAINT "FK_f8a328d892d69b9cee4617a6956" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notify_system_completed_reading_users_user" ADD CONSTRAINT "FK_2f4cbcd7e92ca19bd9660013fac" FOREIGN KEY ("notifySystemId") REFERENCES "notify_system"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notify_system_completed_reading_users_user" ADD CONSTRAINT "FK_eb0b020a8eb5fceef87a90a950e" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "FK_1077d47e0112cad3c16bbcea6cd" FOREIGN KEY ("categoryId") REFERENCES "post_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "FK_5c1cf55c308037b5aca1038a131" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "FK_a6f1ff575d8d9f6e635598de273" FOREIGN KEY ("voteId") REFERENCES "vote"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "post_tags_tags" ADD CONSTRAINT "FK_ba037b6fe8bd028a82b36384672" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_tags_tags" ADD CONSTRAINT "FK_fd01de8916c2da37ddda2808461" FOREIGN KEY ("tagsId") REFERENCES "tags"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reply" ADD CONSTRAINT "FK_3eba86f2b7658cbe427b61796d5" FOREIGN KEY ("replyUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reply" ADD CONSTRAINT "FK_b63950f2876403407137a257a9a" FOREIGN KEY ("commentId") REFERENCES "comment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reply" ADD CONSTRAINT "FK_e9886d6d04a19413a2f0aac5d7b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reply" ADD CONSTRAINT "FK_f0af68fe0e599c7cc7f34699ad5" FOREIGN KEY ("parentReplyId") REFERENCES "reply"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "FK_4b6fe2df37305bc075a4a16d3ea" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "FK_97372830f2390803a3e2df4a46e" FOREIGN KEY ("commentId") REFERENCES "comment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "FK_f9f267c9398d503975b66f06693" FOREIGN KEY ("replyId") REFERENCES "reply"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "report_user_user" ADD CONSTRAINT "FK_0b5ca52e3e5f5870168c60b6bcd" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "report_user_user" ADD CONSTRAINT "FK_37d87b094a1ffdb2613e8987659" FOREIGN KEY ("reportId") REFERENCES "report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "FK_50cb127cc28cf5075eda2fbaa85" FOREIGN KEY ("levelId") REFERENCES "user_level_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "FK_9930fb5d00f5bfaa506645f811c" FOREIGN KEY ("followersId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_favorite_comment_comment" ADD CONSTRAINT "FK_effee35628e49721d3b3d180337" FOREIGN KEY ("commentId") REFERENCES "comment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_favorite_comment_comment" ADD CONSTRAINT "FK_f6e187c2b9a4358f8e998685bef" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_favorite_post_post" ADD CONSTRAINT "FK_237368efde87627445bbb33d787" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_favorite_post_post" ADD CONSTRAINT "FK_e9db2a26a78d235de5a90c535d0" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_favorite_reply_reply" ADD CONSTRAINT "FK_65bb39c924197708e90d66f2448" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_favorite_reply_reply" ADD CONSTRAINT "FK_da48e0b9607e9c6cda5cee67c8b" FOREIGN KEY ("replyId") REFERENCES "reply"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_vote_items_vote_item" ADD CONSTRAINT "FK_60bbd864103c3b002b272f5c963" FOREIGN KEY ("voteItemId") REFERENCES "vote_item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_vote_items_vote_item" ADD CONSTRAINT "FK_b4d764e397d331002861120f921" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_votes_vote" ADD CONSTRAINT "FK_1cdd3a9e85dca7f23d032f88374" FOREIGN KEY ("voteId") REFERENCES "vote"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_votes_vote" ADD CONSTRAINT "FK_3d7c5952002bd1c143bc746d070" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vote_item" ADD CONSTRAINT "FK_5d6ca6bf4ffd77c84e50a857cc0" FOREIGN KEY ("voteId") REFERENCES "vote"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

