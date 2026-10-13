"use client";

import { useEffect, useState } from "react";
import { CommunityPost } from "@/src/domain/models";
import { CommunityService } from "@/src/services/contracts";

export function CommunitySheet({ service, onClose }: { service: CommunityService; onClose: () => void }) {
  const [posts, setPosts] = useState<readonly CommunityPost[]>([]);
  useEffect(() => { void service.feed().then((result) => { if (result.ok) setPosts(result.value); }); }, [service]);
  const like = async (postId: string) => { const result = await service.like(postId); if (result.ok) setPosts((current) => current.map((post) => post.id === postId ? result.value : post)); };
  return <div className="modal-layer" role="dialog" aria-modal="true" aria-label="Community"><button className="modal-backdrop" onClick={onClose} aria-label="Close" />
    <section className="bottom-sheet community-sheet"><div className="sheet-handle" /><span className="card-kicker">COMMUNITY MICROSERVICE</span><h2>Small shelf wins</h2><p>Encouragement from people using what they own.</p>
      <div className="community-feed">{posts.map((post) => <article key={post.id}><div className="post-avatar">{post.author[0]}</div><div><strong>{post.author}</strong><p>{post.body}</p><button onClick={() => void like(post.id)}>♡ {post.likes}</button></div></article>)}</div>
    </section></div>;
}
