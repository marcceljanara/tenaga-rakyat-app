import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reviewsService } from '../api';
import { Modal, Button, Textarea } from './ui';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { handleApiError } from '../utils';
import { useAuth } from '../contexts/AuthContext';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: number;
  onSuccess?: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, jobId, onSuccess }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Fetch job reviews to see if the user already reviewed
  const { data: jobReviewsData, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['job-reviews', jobId],
    queryFn: () => reviewsService.getJobReviews(jobId),
    enabled: isOpen && !!jobId,
  });

  const existingReview = jobReviewsData?.data?.find(r => r.reviewer?.id === user?.id);

  // Fetch detail review by id if it exists
  const { data: reviewDetailData, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['review-detail', existingReview?.id],
    queryFn: () => reviewsService.getReviewById(existingReview!.id),
    enabled: !!existingReview?.id,
  });

  const reviewDetail = reviewDetailData?.data || existingReview;

  useEffect(() => {
    if (reviewDetail) {
      setRating(reviewDetail.rating);
      setComment(reviewDetail.comment || '');
      setIsAnonymous(reviewDetail.is_anonymous || false);
    } else {
      setRating(0);
      setComment('');
      setIsAnonymous(false);
    }
  }, [reviewDetail, isOpen]);

  const mutation = useMutation({
    mutationFn: () => {
      if (existingReview) {
        return reviewsService.updateReview(existingReview.id, { rating, comment, is_anonymous: isAnonymous });
      }
      return reviewsService.createReview({ job_id: jobId, rating, comment, is_anonymous: isAnonymous });
    },
    onSuccess: () => {
      toast.success(existingReview ? 'Review berhasil diperbarui' : 'Review berhasil dikirim');
      queryClient.invalidateQueries({ queryKey: ['job-reviews', jobId] });
      queryClient.invalidateQueries({ queryKey: ['job', String(jobId)] });
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (err: any) => {
      handleApiError(err, 'Gagal mengirim review');
    }
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={existingReview ? "Edit Review" : "Berikan Review"}>
      {isLoadingReviews || isLoadingDetail ? (
        <div className="py-8 text-center text-secondary-500">Memuat...</div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Rating (1-5)</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button type="button" key={star} onClick={() => setRating(star)} className="focus:outline-none">
                  <Star className={`w-8 h-8 ${rating >= star ? 'text-warning-500 fill-warning-500' : 'text-secondary-300'}`} />
                </button>
              ))}
            </div>
          </div>
          <Textarea
            label="Ulasan"
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Tulis ulasan Anda di sini..."
            rows={4}
          />
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="anonymous" 
              checked={isAnonymous} 
              onChange={e => setIsAnonymous(e.target.checked)} 
              className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500" 
            />
            <label htmlFor="anonymous" className="text-sm text-secondary-700">Kirim sebagai anonim</label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-secondary-200">
            <Button variant="secondary" onClick={onClose}>Batal</Button>
            <Button
              onClick={() => mutation.mutate()}
              isLoading={mutation.isPending}
              disabled={rating === 0}
            >
              {existingReview ? "Perbarui Review" : "Kirim Review"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

