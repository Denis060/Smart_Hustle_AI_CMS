import React, { useState } from 'react';
import axios from 'axios';

export default function EnrollModal({ course, onClose }) {
  const [form, setForm] = useState({ name: '', email: '', interest: '', motivation: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(course.price > 0 ? 'payment' : 'enrollment');
  const [paymentMethod, setPaymentMethod] = useState('card');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handlePaymentSubmit = () => {
    // For demo purposes, we'll simulate payment processing
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('enrollment');
    }, 2000);
  };

  const handleEnrollmentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/enrollments/enroll', { ...form, courseId: course.id });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to enroll. Please try again.');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
        <div className="bg-slate-800 rounded-xl w-full max-w-md border border-slate-700 p-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4 text-center">Welcome to the Course!</h2>
          <p className="text-slate-300 mb-6 text-center">
            You have been successfully enrolled in <b className="text-white">{course.title}</b>.
          </p>
          <div className="bg-slate-700 rounded-lg p-4 mb-6 w-full">
            <h3 className="text-white font-semibold mb-2">What's Next?</h3>
            <ul className="text-slate-300 text-sm space-y-1">
              <li>• Check your email for course materials</li>
              <li>• Access your student dashboard</li>
              <li>• Join our community discussions</li>
            </ul>
          </div>
          <div className="flex gap-3 w-full">
            <button 
              className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg" 
              onClick={onClose}
            >
              Close
            </button>
            <button 
              className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg"
              onClick={() => window.open('/dashboard', '_blank')}
            >
              Go to Course
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Payment Step for Paid Courses
  if (step === 'payment') {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
        <div className="bg-slate-800 rounded-xl w-full max-w-md border border-slate-700 p-8">
          <h2 className="text-2xl font-bold text-white mb-2">Complete Your Purchase</h2>
          <div className="text-slate-300 mb-6">
            <strong>{course.title}</strong>
            <div className="text-2xl text-cyan-400 font-bold mt-2">
              {course.currency || 'USD'} ${course.price}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-slate-400 mb-2">Payment Method</label>
              <div className="space-y-2">
                <label className="flex items-center p-3 bg-slate-700 rounded cursor-pointer">
                  <input 
                    type="radio" 
                    name="payment" 
                    value="card" 
                    checked={paymentMethod === 'card'}
                    onChange={e => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <span className="text-white">Credit/Debit Card</span>
                    <div className="ml-auto flex gap-1">
                      <span className="text-xs bg-blue-600 px-2 py-1 rounded">VISA</span>
                      <span className="text-xs bg-red-600 px-2 py-1 rounded">MC</span>
                    </div>
                  </div>
                </label>
                <label className="flex items-center p-3 bg-slate-700 rounded cursor-pointer">
                  <input 
                    type="radio" 
                    name="payment" 
                    value="paypal" 
                    checked={paymentMethod === 'paypal'}
                    onChange={e => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-white">PayPal</span>
                  <span className="ml-auto text-xs bg-blue-500 px-2 py-1 rounded">PayPal</span>
                </label>
              </div>
            </div>

            {paymentMethod === 'card' && (
              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Card Number" 
                  className="w-full p-3 rounded bg-slate-700 text-white"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="text" 
                    placeholder="MM/YY" 
                    className="p-3 rounded bg-slate-700 text-white"
                  />
                  <input 
                    type="text" 
                    placeholder="CVV" 
                    className="p-3 rounded bg-slate-700 text-white"
                  />
                </div>
                <input 
                  type="text" 
                  placeholder="Cardholder Name" 
                  className="w-full p-3 rounded bg-slate-700 text-white"
                />
              </div>
            )}

            <div className="bg-slate-700 rounded-lg p-4">
              <div className="flex justify-between text-slate-300">
                <span>Course Price:</span>
                <span>${course.price}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Processing Fee:</span>
                <span>$0.00</span>
              </div>
              <hr className="border-slate-600 my-2" />
              <div className="flex justify-between text-white font-bold text-lg">
                <span>Total:</span>
                <span>${course.price}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button 
              type="button" 
              onClick={onClose} 
              className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg"
            >
              Cancel
            </button>
            <button 
              onClick={handlePaymentSubmit}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg" 
              disabled={loading}
            >
              {loading ? 'Processing...' : `Pay $${course.price}`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Enrollment Step
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-xl w-full max-w-md border border-slate-700 p-8">
        <div className="flex items-center mb-6">
          {course.price > 0 && (
            <button 
              onClick={() => setStep('payment')} 
              className="text-slate-400 hover:text-white mr-3"
            >
              ← Back
            </button>
          )}
          <h2 className="text-2xl font-bold text-white">Enroll in {course.title}</h2>
        </div>

        {course.price > 0 && (
          <div className="bg-green-600/20 border border-green-600 rounded-lg p-3 mb-6">
            <div className="flex items-center text-green-400">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Payment Confirmed - ${course.price}
            </div>
          </div>
        )}

        <form onSubmit={handleEnrollmentSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-400 mb-1">
              Full Name <span className="text-red-400">*</span>
            </label>
            <input 
              type="text" 
              name="name" 
              value={form.name} 
              onChange={handleChange} 
              className="w-full p-3 rounded bg-slate-700 text-white border border-slate-600 focus:border-cyan-500 focus:outline-none" 
              required 
              placeholder="Enter your full name"
            />
          </div>
          
          <div>
            <label className="block text-slate-400 mb-1">
              Email Address <span className="text-red-400">*</span>
            </label>
            <input 
              type="email" 
              name="email" 
              value={form.email} 
              onChange={handleChange} 
              className="w-full p-3 rounded bg-slate-700 text-white border border-slate-600 focus:border-cyan-500 focus:outline-none" 
              required 
              placeholder="your@email.com"
            />
          </div>
          
          <div>
            <label className="block text-slate-400 mb-1">
              Area of Interest
            </label>
            <input 
              type="text" 
              name="interest" 
              value={form.interest} 
              onChange={handleChange} 
              className="w-full p-3 rounded bg-slate-700 text-white border border-slate-600 focus:border-cyan-500 focus:outline-none" 
              placeholder="e.g., Web Development, Data Science"
            />
          </div>
          
          <div>
            <label className="block text-slate-400 mb-1">
              What motivates you to take this course?
            </label>
            <textarea 
              name="motivation" 
              value={form.motivation} 
              onChange={handleChange} 
              className="w-full p-3 rounded bg-slate-700 text-white border border-slate-600 focus:border-cyan-500 focus:outline-none" 
              rows={3}
              placeholder="Tell us what you hope to achieve..."
            />
          </div>

          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2">Course Summary</h3>
            <div className="text-slate-300 text-sm space-y-1">
              <div className="flex justify-between">
                <span>Course:</span>
                <span className="text-white">{course.title}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span>{course.duration || 'Self-paced'}</span>
              </div>
              <div className="flex justify-between">
                <span>Level:</span>
                <span>{(course.difficulty || course.level || 'Beginner').charAt(0).toUpperCase() + (course.difficulty || course.level || 'Beginner').slice(1)}</span>
              </div>
              <div className="flex justify-between">
                <span>Price:</span>
                <span className={course.price > 0 ? 'text-cyan-400' : 'text-green-400'}>
                  {course.price > 0 ? `$${course.price}` : 'FREE'}
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-600/20 border border-red-600 rounded-lg p-3">
              <div className="text-red-400 text-sm">{error}</div>
            </div>
          )}
          
          <div className="flex justify-end gap-4 mt-6">
            <button 
              type="button" 
              onClick={onClose} 
              className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-lg" 
              disabled={loading}
            >
              {loading ? 'Enrolling...' : 'Complete Enrollment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
