import React, { useEffect, useState } from 'react';
import { Transition } from 'react-transition-group';
import Async from 'react-async';
import { Octokit } from '@octokit/core';
import token from '../auth.js';

export default function App() {
	const [inProp, setInProp] = useState(false);
	const [inCommits,] = useState([]);
//	const [inCards, setInCards] = useState(false);
	useEffect(() => {
		setInProp(true);
	}, []);

	var repositories = new Map();
	const octokit = new Octokit({
		auth: token
	});
	class Repository {
		constructor(id, name, html_url, language, updated_at, visibility) {
			this.id = id;
			this.name = name;
			this.url = html_url;
			this.language = language;
			this.updated = updated_at;
			this.visibility = visibility;
			this.commits = 0;
		}
		async getCommits(request) {
			var commitsInfo = await (await fetch(request)).json().then(c => commitsInfo = c);
			this.commits = commitsInfo;
			loadCommits(this.id, this.commits);
			return 0;
		}
	}

	function loadCommits(id, commits) {
		const card = document.getElementById(id);
		if (inCommits.some(cId => cId === id)) return;
		inCommits.push(id);

		var commitsDiv = document.createElement('div');
		commitsDiv.className = 'commits';
		commitsDiv.textContent = commits.length;

		let text = document.createElement('span');
		text.textContent = ' commits';
		text.style.color = 'grey';
		commitsDiv.append(text);

		let visibility = card.getElementsByClassName('visibility')[0];
		visibility.insertAdjacentElement('afterend', commitsDiv);
	}

	const gitHub = () => octokit.request('GET /users/GuilhermeUrenha/repos', {});
	const ActAsync = ({ data, error, isLoading }) => {
		if (isLoading) return '';
		if (error) return `Something went wrong: ${error.message}`;

		for (var repo of data.data) {
			let repository = new Repository(
				repo.id,
				repo.name,
				repo.html_url,
				repo.language,
				repo.updated_at,
				repo.visibility
			);
			repository.getCommits(repo.commits_url.replace('{/sha}', ''));
			repositories.set(repo.id, repository);
		}
		return [...repositories.entries()].map(
			(r) => (
				<div key={r[0]} id={r[0]} className={'githubCard'}>
					<div className='row'>
						<h1 className='title'>
							<a href={r[1].url} target='_blank' rel='noreferrer'>{r[1].name}</a>
						</h1>
						<h2 className='visibility'>{r[1].visibility[0].toUpperCase() + r[1].visibility.substring(1)}</h2>
					</div>
					<div className='row'>
						<p className='language'>{r[1].language}</p>
						<time className='updated'>{daysAgo(r[1].updated)}</time>
					</div>
				</div>
			)
		);
	}

	function daysAgo(date) {
		var formattedDate = 'Atualizado ';
		const today = new Date();
		const elapsedTime = today - new Date(Date.parse(date));
		const elapsedDays = Math.floor(elapsedTime / (1000 * 60 * 60 * 24));
		if (elapsedDays === 0) formattedDate += 'hoje';
		else if (elapsedDays === 1) formattedDate += 'ontem';
		else if (elapsedDays === 2) formattedDate += 'anteontem';
		else if (elapsedDays < 30) formattedDate += `${elapsedDays} dias atrás`;
		else if (elapsedDays > 30) formattedDate += `${Math.floor(elapsedDays % 30)} meses atrás`;
		else formattedDate += 'há muito tempo';
		return formattedDate;
	}

	var assembleDelay = 500;
	function nameAssemble(letter, key, extension) {
		const startingPoint = Math.floor(Math.random() * 2);
		const topStart = 0, bottomStart = 1;
		var startPosition;

		if (startingPoint === topStart)
			startPosition = '-15vmin';
		else if (startingPoint === bottomStart)
			startPosition = '60vmin';
		const assembleTransition = {
			entering: {
				marginTop: startPosition
			},
			entered: {
				marginTop: '15vmin',
				opacity: 1
			}
		};
		return (<Transition in={inProp} key={key} timeout={assembleDelay += 100}>
			{(state) => (
				<div
					className={`NameLetter${extension ? ' NameExtension' : ''}`}
					style={{
						marginTop: startPosition,
						...assembleTransition[state]
					}}
				>
					{letter}
				</div>
			)}
		</Transition>);
	}

	var name = ['G', 'U', 'I', 'L', 'H', 'E', 'R', 'M', 'E'];
	var extension = ['.', 'r', 'a', 'r'];

	return (
		<main>
			<div id='Name'>
				{name.map((letter, key) => nameAssemble(letter, key))}
				{extension.map((letter, key) => nameAssemble(letter, key, true))}
			</div>
			<div id='Github'>
				<section id='githubInfo'>
					<Async promiseFn={gitHub}>
						{ActAsync}
					</Async>
				</section>
				<section id='githubProfile'>

				</section>
			</div>
		</main>
	);
};
