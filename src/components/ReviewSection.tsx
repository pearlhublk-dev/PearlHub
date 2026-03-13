import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useAppContext } from "@/context/AppContext";

interface ReviewSectionProps {
  listingId: string;
  listingType: "stay" | "vehicle" | "event";
}

interface Review {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
  user_id: string;
}

const ReviewSection = ({ listingId, listingType }: ReviewSectionProps) => {
  const { user, profile } = useAuth();
  const { showToast } = useAppContext();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("listing_id", listingId)
        .eq("listing_type", listingType)
        .order("created_at", { ascending: false });
      setReviews((data as Review[]) || []);
      setLoading(false);
    };
    fetch();
  }, [listingId, listingType]);

  const handleSubmit = async () => {
    if (!user) { showToast("Please sign in to leave a review.", "error"); return; }
    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      listing_id: listingId,
      listing_type: listingType,
      user_id: user.id,
      user_name: profile?.full_name || "Anonymous",
      rating,
      comment,
    });
    if (error) { showToast("Failed to submit review.", "error"); }
    else {
      showToast("Review submitted!", "success");
      setComment("");
      setRating(5);
      // Re-fetch
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("listing_id", listingId)
        .eq("listing_type", listingType)
        .order("created_at", { ascending: false });
      setReviews((data as Review[]) || []);
    }
    setSubmitting(false);
  };

  const avg = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
  const starCounts = [5, 4, 3, 2, 1].map(s => ({ star: s, count: reviews.filter(r => r.rating === s).length }));

  return (
    <div className="mt-5">
      <h4 className="text-sm font-bold mb-3">⭐ Reviews & Ratings</h4>

      {/* Summary */}
      {reviews.length > 0 && (
        <div className="flex items-center gap-4 mb-4 bg-background rounded-lg p-3">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{avg.toFixed(1)}</div>
            <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <span key={s} className={s <= Math.round(avg) ? "text-primary" : "text-muted-foreground/30"}>★</span>)}</div>
            <div className="text-[11px] text-muted-foreground">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</div>
          </div>
          <div className="flex-1">
            {starCounts.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="w-3">{star}</span>
                <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: reviews.length ? `${(count / reviews.length) * 100}%` : "0%" }} />
                </div>
                <span className="w-5 text-right text-muted-foreground">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit form */}
      <div className="bg-background rounded-lg p-3 mb-4">
        <div className="text-xs font-semibold mb-2">{user ? "Leave a Review" : "Sign in to review"}</div>
        <div className="flex gap-1 mb-2">
          {[1,2,3,4,5].map(s => (
            <button key={s} onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(s)}
              className={`text-lg transition-transform hover:scale-110 ${s <= (hoverRating || rating) ? "text-primary" : "text-muted-foreground/30"}`}>★</button>
          ))}
        </div>
        <textarea value={comment} onChange={e => setComment(e.target.value)} rows={2} placeholder="Share your experience…"
          className="w-full rounded-md border border-input px-3 py-2 text-sm resize-y mb-2" disabled={!user} />
        <button onClick={handleSubmit} disabled={!user || submitting}
          className="px-4 py-1.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground disabled:opacity-50 transition-all">
          {submitting ? "Submitting…" : "Submit Review"}
        </button>
      </div>

      {/* Reviews list */}
      {loading ? (
        <p className="text-xs text-muted-foreground">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">No reviews yet. Be the first!</p>
      ) : (
        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
          {reviews.map(r => (
            <div key={r.id} className="bg-card rounded-lg p-3 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs">👤</div>
                <span className="font-bold text-xs">{r.user_name}</span>
                <div className="flex gap-0.5 ml-1">{[1,2,3,4,5].map(s => <span key={s} className={`text-xs ${s <= r.rating ? "text-primary" : "text-muted-foreground/30"}`}>★</span>)}</div>
                <span className="text-[10px] text-muted-foreground ml-auto">{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
              {r.comment && <p className="text-xs text-muted-foreground ml-9">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
