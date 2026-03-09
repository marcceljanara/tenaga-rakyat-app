import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { reviewsService } from '../api';
import { Modal, Button, Textarea } from './ui';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: number;
  revieweeId: string;
  onSuccess?: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, jobId, revieweeId, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const mutation = useMutation({
    mutationFn: () => reviewsService.createReview({ job_id: jobId, reviewee_id: revieweeId, rating, comment }),
    onSuccess: () => {
      toast.success('Review berhasil dikirim');
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.errors || 'Gagal mengirim review');
    }
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Berikan Review">
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
        <div className="flex justify-end gap-3 pt-4 border-t border-secondary-200">
          <Button variant="secondary" onClick={onClose}>Batal</Button>
          <Button
            onClick={() => mutation.mutate()}
            isLoading={mutation.isPending}
            disabled={rating === 0}
          >
            Kirim Review
          </Button>
        </div>
      </div>
    </Modal>
  );
};
