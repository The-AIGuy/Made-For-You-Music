/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import type { SongLibraryItem } from '../types.js';
import {
  Headphones,
  Play,
  Pause,
  Music,
  Filter,
  Sparkles,
  ArrowRight,
  Shield,
  Volume2,
} from 'lucide-react';

interface ListenPageProps {
  navigate: (path: string) => void;
}

export const ListenPage: React.FC<ListenPageProps> = ({ navigate }) => {
  const [songs, setSongs] = useState<SongLibraryItem[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    api.getSongLibrary().then((res) => {
      // The API automatically enforces isPublic === true for non-admins
      setSongs(res.songs);
    }).catch(() => {}).finally(() => setIsLoading(false));
  }, []);

  const genres = ['All', 'Pop', 'Acoustic / Folk', 'Rock', 'Country', 'R&B / Soul'];

  const filteredSongs = selectedGenre === 'All'
    ? songs
    : songs.filter((s) => s.genre.toLowerCase().includes(selectedGenre.toLowerCase()));

  const handleTogglePlay = (song: SongLibraryItem) => {
    if (playingSongId === song.id) {
      audioElement?.pause();
      setPlayingSongId(null);
    } else {
      audioElement?.pause();
      const audio = new Audio(song.audioUrl);
      audio.play().catch(() => {
        console.log('Playback error');
      });
      audio.onended = () => setPlayingSongId(null);
      setAudioElement(audio);
      setPlayingSongId(song.id);
    }
  };

  useEffect(() => {
    return () => {
      audioElement?.pause();
    };
  }, [audioElement]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 text-[#00708A] text-xs font-bold uppercase tracking-wider">
          <Headphones className="w-3.5 h-3.5 text-[#08BFE8]" />
          Approved Public Showcase
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-[#421078]">
          Listen To Real M4UM Songs
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Explore genuine custom tracks crafted for anniversaries, birthdays, weddings, and milestones. All songs in our showcase have been approved for public listening by our customers.
        </p>
      </div>

      {/* Genre Filter Pills */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {genres.map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGenre(g)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              selectedGenre === g
                ? 'bg-[#421078] text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-purple-300'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Songs Grid or Empty State */}
      {isLoading ? (
        <div className="p-16 text-center text-xs text-slate-400 bg-white rounded-3xl border border-purple-100">
          Loading approved showcase tracks...
        </div>
      ) : filteredSongs.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-purple-100 max-w-md mx-auto space-y-4">
          <Headphones className="w-12 h-12 text-purple-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-lg">No Public Songs in this Genre</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            We hold customer privacy in the highest regard. Songs only appear in our showcase when customers have explicitly opted to make them public.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSongs.map((song) => {
            const isPlaying = playingSongId === song.id;
            return (
              <div
                key={song.id}
                className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  {/* Artwork & Play overlay */}
                  <div className="relative rounded-2xl overflow-hidden aspect-video bg-purple-900/10 group">
                    <img
                      src={song.coverUrl}
                      alt={song.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      onClick={() => handleTogglePlay(song)}
                      className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-[#421078] text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all"
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                    </button>
                    {isPlaying && (
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] flex items-center gap-1 backdrop-blur-xs">
                        <Volume2 className="w-3 h-3 text-[#FFD52A] animate-pulse" />
                        <span>Now Playing</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-bold text-[#421078]">{song.genre}</span>
                      <span className="font-medium">{song.duration}</span>
                    </div>
                    <h3 className="font-heading font-bold text-lg text-slate-900 mt-1 truncate">
                      {song.title}
                    </h3>
                    {song.recipientName && (
                      <p className="text-xs text-slate-500">
                        Crafted for {song.recipientName} {song.occasion ? `· ${song.occasion}` : ''}
                      </p>
                    )}
                  </div>

                  {/* Lyrics snippet */}
                  <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100/60 text-xs italic text-slate-700 leading-relaxed">
                    "{song.sampleLyricsSnippet}"
                  </div>
                </div>

                <button
                  onClick={() => navigate('/create')}
                  className="w-full py-2.5 rounded-full text-xs font-bold text-[#421078] border border-purple-200 hover:bg-purple-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Create A Song Like This</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Trust banner */}
      <div className="bg-purple-50/70 rounded-3xl p-8 border border-purple-200/80 max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
        <Shield className="w-10 h-10 text-[#421078] shrink-0" />
        <div className="space-y-1 flex-1">
          <h4 className="font-bold text-sm text-slate-900">Your Personal Song Remains 100% Private By Default</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            We never share or publish your finished music, recipient names, or lyrics without your explicit written approval. Your private stories belong solely to you and your recipient.
          </p>
        </div>
      </div>
    </div>
  );
};
