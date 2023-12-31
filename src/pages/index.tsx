import { SignIn, SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { Sign } from "crypto";
import Head from "next/head";
import Link from "next/link";
import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { LoadingPage } from "~/components/loading";
import { useState } from "react";
dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { user } = useUser();

  const [input, setInput] = useState<string>("");

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation();

  console.log(user);
  if (!user) return null;
  return (
    <div className="flex w-full gap-3">
      <Image
        src={user.profileImageUrl}
        alt="Profile Image"
        className="h-14 w-14 rounded-full"
        width={56}
        height={56}
        />
      <input placeholder="Type some emojis!" className="grow bg-transparent" type="text" value={input} onChange={(e) => setInput(e.target.value)}/>
      <button onClick={() => mutate({ content: input})}> Post </button>
    </div>
  );
};

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div key={post.id} className="border-b p-4 flex gap-3">
      <Image src={author.profileImageUrl} 
        className="h-14 w-14 rounded-full" 
        alt={`@${author.username}'s profile picture`}
        width={56}
        height={56}
      />
      <div className="flex flex-col">
        <div className="flex text-slate-400 gap-2">
          <span>{`@${author.username}`}</span> · <span>{dayjs(post.createdAt).fromNow()}</span>
        </div>
        <span className="text-2xl"> {post.content} </span>
      </div>
    </div>
  );
};

const Feed = () => {
  const { data, isLoading:postLoading } = api.posts.getAll.useQuery();

  if(postLoading) return <LoadingPage/>;

  if (!data) return <div>Something went wrong</div>;

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

export default function Home() {
  
  const {isLoaded: userLoaded, isSignedIn } = useUser();

  api.posts.getAll.useQuery();

  if (!userLoaded) return <div/>;


  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex justify-center h-screen">
        <div className="md:max-w-2xl w-full h-full border-x">
          <div className="flex border-b p-4"> 
            {!isSignedIn && <SignInButton/>} {isSignedIn && <CreatePostWizard/>}
          </div>
          <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
          <Feed />
        </div>
      </main>
    </>
  );
}
