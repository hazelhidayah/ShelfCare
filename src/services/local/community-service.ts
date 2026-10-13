import { err, ok, Result } from "@/src/core/result";
import { CommunityPost } from "@/src/domain/models";
import { CommunityService } from "@/src/services/contracts";

export class LocalCommunityService implements CommunityService {
  private posts: CommunityPost[] = [
    { id: "1", author: "Mina", body: "Finished my first product before buying another ✨", likes: 18 },
    { id: "2", author: "Jo", body: "A simple three-step night routine saved my skin barrier.", likes: 27 },
  ];
  async feed(): Promise<Result<readonly CommunityPost[]>> { return ok(this.posts); }
  async like(postId: string): Promise<Result<CommunityPost>> {
    const post = this.posts.find((item) => item.id === postId);
    if (!post) return err("not_found", "That post is no longer available.");
    const updated = { ...post, likes: post.likes + 1 };
    this.posts = this.posts.map((item) => item.id === postId ? updated : item);
    return ok(updated);
  }
}
