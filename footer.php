</main>
<footer>
	<div class="container">
		<div>
			<strong>Public Employment Service Office</strong>
			Free employment assistance for jobseekers and employers, supervised by the Department of Labor and Employment (DOLE).
		</div>
		<div>
			<strong>Office hours</strong>
			Monday to Friday, 8:00 AM to 5:00 PM
		</div>
		<div class="legal">
			Personal data is processed under the Data Privacy Act of 2012 (RA 10173). © <?= date('Y') ?> PESO.
		</div>
	</div>
</footer>

<!-- Unified Login Dialog -->
<dialog id="loginDlg">
	<div class="dlg">
		<button class="x" type="button" data-close aria-label="Close">×</button>
		<h2>Log in</h2>
		<form action="login.php" method="post">
			<div class="field">
				<label for="loginEmail">Email address</label>
				<input id="loginEmail" name="email" type="email" autocomplete="email" required>
			</div>
			<div class="field">
				<label for="loginPassword">Password</label>
				<div class="pw">
					<input id="loginPassword" name="password" type="password" autocomplete="current-password" required>
					<button type="button" data-toggle-pw="loginPassword">Show</button>
				</div>
			</div>
			<div class="acts">
				<button type="submit" class="btn btn-p">Log in</button>
			</div>
		</form>
		<p class="alt2">No account yet? <a href="index.html#join" data-close>Create one</a></p>
	</div>
</dialog>

<!-- Link your JS files here so they load on every page -->
<script src="js/script.js" defer></script>
<script src="js/auth.js" defer></script>
</body>
</html>