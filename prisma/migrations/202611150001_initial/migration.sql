CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "goal" INTEGER NOT NULL DEFAULT 20,
    "sessionVersion" INTEGER NOT NULL DEFAULT 0,
    "avatar" TEXT NOT NULL DEFAULT '🎓',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "ownerId" TEXT,
    "kind" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "options" TEXT[],
    "answer" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "source" TEXT,
    "origin" TEXT NOT NULL DEFAULT 'AI',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Exam" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "configuration" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'GENERATING',
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExamQuestion" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "response" TEXT,
    "marked" BOOLEAN NOT NULL DEFAULT false,
    "correct" BOOLEAN,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ExamQuestion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FavoriteQuestion" (
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    CONSTRAINT "FavoriteQuestion_pkey" PRIMARY KEY ("userId", "questionId")
);

CREATE TABLE "StudyMaterial" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StudyMaterial_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StudyPlan" (
    "userId" TEXT NOT NULL,
    "examDate" TIMESTAMP(3) NOT NULL,
    "courseIds" TEXT[],
    CONSTRAINT "StudyPlan_pkey" PRIMARY KEY ("userId")
);

CREATE TABLE "AIConversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contextId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AIConversation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AIMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AIMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AIUsageLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "units" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "AIUsageLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SystemSetting" (
    "key" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("key")
);

CREATE TABLE "QuestionReport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "QuestionReport_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AdminAuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RateLimit" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("key")
);

CREATE TABLE "PasswordReset" (
    "hash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("hash")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

ALTER TABLE "Topic" ADD CONSTRAINT "Topic_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE UNIQUE INDEX "Topic_courseId_name_key" ON "Topic"("courseId", "name");

ALTER TABLE "Question" ADD CONSTRAINT "Question_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Question" ADD CONSTRAINT "Question_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Question" ADD CONSTRAINT "Question_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "Question_courseId_topicId_active_idx" ON "Question"("courseId", "topicId", "active");

CREATE INDEX "Question_ownerId_idx" ON "Question"("ownerId");

ALTER TABLE "Exam" ADD CONSTRAINT "Exam_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "Exam_userId_requestId_key" ON "Exam"("userId", "requestId");

CREATE INDEX "Exam_userId_status_createdAt_idx" ON "Exam"("userId", "status", "createdAt");

ALTER TABLE "ExamQuestion" ADD CONSTRAINT "ExamQuestion_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ExamQuestion" ADD CONSTRAINT "ExamQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "ExamQuestion_examId_position_key" ON "ExamQuestion"("examId", "position");

CREATE INDEX "ExamQuestion_questionId_idx" ON "ExamQuestion"("questionId");

ALTER TABLE "FavoriteQuestion" ADD CONSTRAINT "FavoriteQuestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FavoriteQuestion" ADD CONSTRAINT "FavoriteQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StudyMaterial" ADD CONSTRAINT "StudyMaterial_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "StudyMaterial_userId_idx" ON "StudyMaterial"("userId");

ALTER TABLE "StudyPlan" ADD CONSTRAINT "StudyPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AIConversation" ADD CONSTRAINT "AIConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "AIConversation_userId_updatedAt_idx" ON "AIConversation"("userId", "updatedAt");

ALTER TABLE "AIMessage" ADD CONSTRAINT "AIMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AIConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "AIMessage_conversationId_createdAt_idx" ON "AIMessage"("conversationId", "createdAt");

ALTER TABLE "AIUsageLog" ADD CONSTRAINT "AIUsageLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "AIUsageLog_userId_day_key" ON "AIUsageLog"("userId", "day");

ALTER TABLE "QuestionReport" ADD CONSTRAINT "QuestionReport_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "QuestionReport_userId_questionId_key" ON "QuestionReport"("userId", "questionId");

ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "PasswordReset_userId_idx" ON "PasswordReset"("userId");
